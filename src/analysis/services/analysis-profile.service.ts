import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAnalysisProfileDto,
  UpdateAnalysisProfileDto,
  AnalysisProfileResponse,
} from '../dto';
import { AuthContext, SecurityUtil } from '../../common/utils/security.util';
import { MessageResponse } from '../../common/types/api-responses';

@Injectable()
export class AnalysisProfileService {
  private readonly logger = new Logger(AnalysisProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateAnalysisProfileDto,
    authContext: AuthContext,
  ): Promise<AnalysisProfileResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'create analysis profile',
    );

    // Check for duplicate name + version
    const existing = await this.prisma.analysisProfile.findUnique({
      where: {
        projectId_name_version: {
          projectId,
          name: dto.name,
          version: dto.version || 1,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Profile "${dto.name}" version ${dto.version || 1} already exists`,
      );
    }

    this.logger.log(`Creating analysis profile "${dto.name}" for project ${projectId}`);

    const profile = await this.prisma.analysisProfile.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        version: dto.version || 1,
        graphDefinition: dto.graphDefinition,
        entitySchemaIds: dto.entitySchemaIds,
        triggerOnReceive: dto.triggerOnReceive ?? false,
        triggerOnSchedule: dto.triggerOnSchedule,
        triggerOnDemand: dto.triggerOnDemand ?? true,
        storeEntities: dto.storeEntities ?? true,
        generateTags: dto.generateTags ?? false,
      },
    });

    return this.mapToResponse(profile);
  }

  async findAll(
    projectId: string,
    authContext: AuthContext,
  ): Promise<AnalysisProfileResponse[]> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'list analysis profiles',
    );

    const profiles = await this.prisma.analysisProfile.findMany({
      where: {
        projectId,
        isActive: true,
      },
      orderBy: [
        { name: 'asc' },
        { version: 'desc' },
      ],
    });

    return profiles.map((p) => this.mapToResponse(p));
  }

  async findOne(
    projectId: string,
    profileId: string,
    authContext: AuthContext,
  ): Promise<AnalysisProfileResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'get analysis profile',
    );

    const profile = await this.prisma.analysisProfile.findFirst({
      where: {
        id: profileId,
        projectId,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        `Analysis profile ${profileId} not found in project ${projectId}`,
      );
    }

    return this.mapToResponse(profile);
  }

  async update(
    projectId: string,
    profileId: string,
    dto: UpdateAnalysisProfileDto,
    authContext: AuthContext,
  ): Promise<AnalysisProfileResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'update analysis profile',
    );

    const existing = await this.prisma.analysisProfile.findFirst({
      where: {
        id: profileId,
        projectId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Analysis profile ${profileId} not found in project ${projectId}`,
      );
    }

    this.logger.log(`Updating analysis profile ${profileId} in project ${projectId}`);

    const updated = await this.prisma.analysisProfile.update({
      where: { id: profileId },
      data: {
        name: dto.name,
        description: dto.description,
        graphDefinition: dto.graphDefinition,
        entitySchemaIds: dto.entitySchemaIds,
        triggerOnReceive: dto.triggerOnReceive,
        triggerOnSchedule: dto.triggerOnSchedule,
        triggerOnDemand: dto.triggerOnDemand,
        storeEntities: dto.storeEntities,
        generateTags: dto.generateTags,
      },
    });

    return this.mapToResponse(updated);
  }

  async delete(
    projectId: string,
    profileId: string,
    authContext: AuthContext,
  ): Promise<MessageResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'delete analysis profile',
    );

    const existing = await this.prisma.analysisProfile.findFirst({
      where: {
        id: profileId,
        projectId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Analysis profile ${profileId} not found in project ${projectId}`,
      );
    }

    this.logger.log(`Deleting analysis profile ${profileId} from project ${projectId}`);

    // Soft delete
    await this.prisma.analysisProfile.update({
      where: { id: profileId },
      data: { isActive: false },
    });

    return { message: 'Analysis profile deleted successfully' };
  }

  private mapToResponse(profile: any): AnalysisProfileResponse {
    return {
      id: profile.id,
      projectId: profile.projectId,
      name: profile.name,
      description: profile.description,
      version: profile.version,
      graphDefinition: profile.graphDefinition,
      entitySchemaIds: profile.entitySchemaIds,
      triggerOnReceive: profile.triggerOnReceive,
      triggerOnSchedule: profile.triggerOnSchedule,
      triggerOnDemand: profile.triggerOnDemand,
      storeEntities: profile.storeEntities,
      generateTags: profile.generateTags,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
