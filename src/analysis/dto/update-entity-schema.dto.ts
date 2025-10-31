import { IsString, IsOptional, IsNumber, IsObject, IsIn } from 'class-validator';

export class UpdateEntitySchemaDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['llm_extraction', 'rule_based', 'api_logged'])
  extractionType?: 'llm_extraction' | 'rule_based' | 'api_logged';

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsObject()
  ruleDefinition?: Record<string, any>;
}
