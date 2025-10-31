import { IsString, IsOptional, IsObject, IsArray, IsBoolean } from 'class-validator';

export class UpdateAnalysisProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  graphDefinition?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entitySchemaIds?: string[];

  @IsOptional()
  @IsBoolean()
  storeEntities?: boolean;

  @IsOptional()
  @IsBoolean()
  generateTags?: boolean;
}
