export interface AnalysisProfileResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: number;
  graphDefinition: Record<string, any>;
  entitySchemaIds: string[];
  triggerOnReceive: boolean;
  triggerOnSchedule?: string;
  triggerOnDemand: boolean;
  storeEntities: boolean;
  generateTags: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
