import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TierLimitsService } from './tier-limits.service';
import { SubscriptionTier } from '@prisma/client';

// ProjectStatus enum (will be available after migration)
type ProjectStatus = 'ACTIVE' | 'SUSPENDED';

export interface SuspensionInfo {
  hasSuspendedProjects: boolean;
  suspendedCount: number;
  activeCount: number;
  allowedCount: number;
  projectsToDelete: number;
}

@Injectable()
export class DowngradeHandlerService {
  private readonly logger = new Logger(DowngradeHandlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tierLimitsService: TierLimitsService,
  ) {}

  /**
   * Handle tier downgrade - suspend excess projects beyond new limit
   * Implements "grace period" strategy: excess projects become read-only
   */
  async handleDowngrade(userId: string, newTier: SubscriptionTier): Promise<void> {
    const limits = this.tierLimitsService.getLimits(newTier);
    const projectLimit = limits.projects;

    // If unlimited projects, no need to suspend anything
    if (projectLimit === -1) {
      return;
    }

    // Get all user's projects ordered by creation date (oldest first)
    const projects = await this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });

    const totalProjects = projects.length;

    if (totalProjects <= projectLimit) {
      // User is within limits, ensure all projects are active
      await this.prisma.project.updateMany({
        where: {
          ownerId: userId,
          status: 'SUSPENDED',
        },
        data: { status: 'ACTIVE' },
      });
      return;
    }

    // Suspend excess projects (keep oldest projects active, suspend newest)
    const projectsToSuspend = projects.slice(projectLimit);
    const suspendIds = projectsToSuspend.map((p) => p.id);

    await this.prisma.project.updateMany({
      where: {
        id: { in: suspendIds },
      },
      data: { status: 'SUSPENDED' },
    });

    this.logger.log(
      `Downgrade: User ${userId} tier changed to ${newTier}. Suspended ${suspendIds.length} projects (limit: ${projectLimit})`,
    );
  }

  /**
   * Get suspension information for a user
   */
  async getSuspensionInfo(userId: string): Promise<SuspensionInfo> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return {
        hasSuspendedProjects: false,
        suspendedCount: 0,
        activeCount: 0,
        allowedCount: 0,
        projectsToDelete: 0,
      };
    }

    const limits = this.tierLimitsService.getLimits(user.subscriptionTier);
    const allowedCount = limits.projects === -1 ? -1 : limits.projects;

    const [suspendedCount, activeCount] = await Promise.all([
      this.prisma.project.count({
        where: { ownerId: userId, status: 'SUSPENDED' },
      }),
      this.prisma.project.count({
        where: { ownerId: userId, status: 'ACTIVE' },
      }),
    ]);

    const projectsToDelete = suspendedCount > 0 ? suspendedCount : 0;

    return {
      hasSuspendedProjects: suspendedCount > 0,
      suspendedCount,
      activeCount,
      allowedCount,
      projectsToDelete,
    };
  }

  /**
   * Check if a project is suspended and throw error if write operation attempted
   */
  async validateProjectAction(projectId: string, action: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true, ownerId: true },
    });

    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    if (project.status === 'SUSPENDED') {
      throw new ForbiddenException(
        `This project is suspended due to tier limits. Please upgrade your subscription or delete ${
          (await this.getSuspensionInfo(project.ownerId)).projectsToDelete
        } project(s) to restore access.`,
      );
    }
  }

  /**
   * Check if user has suspended projects before allowing new project creation
   */
  async checkSuspendedProjectsBeforeCreate(userId: string): Promise<void> {
    const suspensionInfo = await this.getSuspensionInfo(userId);

    if (suspensionInfo.hasSuspendedProjects) {
      throw new ForbiddenException(
        `You have ${suspensionInfo.suspendedCount} suspended project(s). Please delete them or upgrade your subscription before creating new projects.`,
      );
    }
  }

  /**
   * Restore suspended projects when user upgrades
   */
  async handleUpgrade(userId: string, newTier: SubscriptionTier): Promise<void> {
    const limits = this.tierLimitsService.getLimits(newTier);
    const projectLimit = limits.projects;

    // Get all projects
    const totalProjects = await this.prisma.project.count({
      where: { ownerId: userId },
    });

    // If new limit accommodates all projects, restore everything
    if (projectLimit === -1 || totalProjects <= projectLimit) {
      await this.prisma.project.updateMany({
        where: {
          ownerId: userId,
          status: 'SUSPENDED',
        },
        data: { status: 'ACTIVE' },
      });

      this.logger.log(`Upgrade: User ${userId} upgraded to ${newTier}. All projects restored.`);
    } else {
      // Still over limit even with upgrade - keep some suspended
      const projects = await this.prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'asc' },
      });

      const projectsToActivate = projects.slice(0, projectLimit).map((p) => p.id);

      await this.prisma.project.updateMany({
        where: {
          id: { in: projectsToActivate },
        },
        data: { status: 'ACTIVE' },
      });

      this.logger.log(
        `Upgrade: User ${userId} upgraded to ${newTier}. Restored ${projectsToActivate.length} projects (limit: ${projectLimit})`,
      );
    }
  }
}
