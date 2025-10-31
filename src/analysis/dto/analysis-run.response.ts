export interface AnalysisRunResponse {
  id: string;
  projectId: string;
  profileId: string;
  profileVersion: number;
  targetType: string;
  targetIds: string[];
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  status: string;
  progress: number;
  entitiesExtracted: number;
  errorMessage?: string;
  tokensUsed?: number;
  estimatedCostUsd?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}
