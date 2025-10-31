import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntitySchemaDto, EntitySchemaResponse } from '../dto';
import { AuthContext, SecurityUtil } from '../../common/utils/security.util';

@Injectable()
export class EntitySchemaService {
  private readonly logger = new Logger(EntitySchemaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateEntitySchemaDto,
    authContext: AuthContext,
  ): Promise<EntitySchemaResponse> {
    // Validate project access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'create entity schema',
    );

    // Check for duplicate name
    const existing = await this.prisma.entitySchema.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Entity schema with name "${dto.name}" already exists in this project`,
      );
    }

    this.logger.log(
      `Creating entity schema "${dto.name}" for project ${projectId}`,
    );

    const schema = await this.prisma.entitySchema.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        extractionType: dto.extractionType,
        properties: dto.properties,
        prompt: dto.prompt,
        model: dto.model || 'gpt-4o-mini',
        temperature: dto.temperature ?? 0.1,
        ruleDefinition: dto.ruleDefinition,
      },
    });

    return this.mapToResponse(schema);
  }

  async findAll(
    projectId: string,
    authContext: AuthContext,
  ): Promise<EntitySchemaResponse[]> {
    // Validate project access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'list entity schemas',
    );

    const schemas = await this.prisma.entitySchema.findMany({
      where: {
        projectId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return schemas.map(s => this.mapToResponse(s));
  }

  async findOne(
    projectId: string,
    schemaId: string,
    authContext: AuthContext,
  ): Promise<EntitySchemaResponse> {
    // Validate project access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'get entity schema',
    );

    const schema = await this.prisma.entitySchema.findFirst({
      where: {
        id: schemaId,
        projectId,
      },
    });

    if (!schema) {
      throw new NotFoundException(
        `Entity schema ${schemaId} not found in project ${projectId}`,
      );
    }

    return this.mapToResponse(schema);
  }

  async update(
    projectId: string,
    schemaId: string,
    dto: Partial<CreateEntitySchemaDto>,
    authContext: AuthContext,
  ): Promise<EntitySchemaResponse> {
    // Validate project access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'update entity schema',
    );

    // Verify schema exists and belongs to project
    const existing = await this.prisma.entitySchema.findFirst({
      where: {
        id: schemaId,
        projectId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Entity schema ${schemaId} not found in project ${projectId}`,
      );
    }

    // Check for name conflict if name is being changed
    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.prisma.entitySchema.findUnique({
        where: {
          projectId_name: {
            projectId,
            name: dto.name,
          },
        },
      });

      if (conflict) {
        throw new ConflictException(
          `Entity schema with name "${dto.name}" already exists in this project`,
        );
      }
    }

    this.logger.log(`Updating entity schema ${schemaId} in project ${projectId}`);

    const updated = await this.prisma.entitySchema.update({
      where: { id: schemaId },
      data: {
        name: dto.name,
        description: dto.description,
        extractionType: dto.extractionType,
        properties: dto.properties,
        prompt: dto.prompt,
        model: dto.model,
        temperature: dto.temperature,
        ruleDefinition: dto.ruleDefinition,
      },
    });

    return this.mapToResponse(updated);
  }

  async delete(
    projectId: string,
    schemaId: string,
    authContext: AuthContext,
  ): Promise<void> {
    // Validate project access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'delete entity schema',
    );

    // Verify schema exists and belongs to project
    const existing = await this.prisma.entitySchema.findFirst({
      where: {
        id: schemaId,
        projectId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Entity schema ${schemaId} not found in project ${projectId}`,
      );
    }

    this.logger.log(`Deleting entity schema ${schemaId} from project ${projectId}`);

    // Soft delete by marking as inactive
    await this.prisma.entitySchema.update({
      where: { id: schemaId },
      data: { isActive: false },
    });
  }

  private mapToResponse(schema: any): EntitySchemaResponse {
    return {
      id: schema.id,
      projectId: schema.projectId,
      name: schema.name,
      description: schema.description,
      extractionType: schema.extractionType,
      properties: schema.properties,
      prompt: schema.prompt,
      model: schema.model,
      temperature: schema.temperature,
      ruleDefinition: schema.ruleDefinition,
      isActive: schema.isActive,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }
}
