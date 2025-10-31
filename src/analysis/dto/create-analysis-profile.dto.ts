import { IsString, IsOptional, IsNumber, IsObject, IsArray, IsBoolean } from 'class-validator';

export class CreateAnalysisProfileDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  version?: number;

  @IsObject()
  graphDefinition: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  entitySchemaIds: string[];

  @IsOptional()
  @IsBoolean()
  triggerOnReceive?: boolean;

  @IsOptional()
  @IsString()
  triggerOnSchedule?: string;

  @IsOptional()
  @IsBoolean()
  triggerOnDemand?: boolean;

  @IsOptional()
  @IsBoolean()
  storeEntities?: boolean;

  @IsOptional()
  @IsBoolean()
  generateTags?: boolean;
}
