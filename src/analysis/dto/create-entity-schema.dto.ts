import { IsString, IsOptional, IsEnum, IsObject, IsNumber, Min, Max, ValidateIf } from 'class-validator';
import { ExtractionType } from '../enums';

export class CreateEntitySchemaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ExtractionType)
  extractionType: ExtractionType;

  @IsObject()
  properties: Record<string, any>;

  // LLM extraction fields
  @ValidateIf(o => o.extractionType === ExtractionType.LLM_EXTRACTION)
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  // Rule-based extraction fields
  @ValidateIf(o => o.extractionType === ExtractionType.RULE_BASED)
  @IsObject()
  ruleDefinition?: Record<string, any>;
}
