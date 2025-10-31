export interface AnalysisProfileResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: number;
  graphDefinition: Record<string, any>;
  entitySchemaIds: string[];
  storeEntities: boolean;
  generateTags: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
