import { ExtractionType } from '../enums';

export class EntitySchemaResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  extractionType: ExtractionType;
  properties: Record<string, any>;
  prompt?: string;
  model?: string;
  temperature?: number;
  ruleDefinition?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
