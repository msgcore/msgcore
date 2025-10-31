export interface AnalysisStatsResponse {
  totalRuns: number;
  runsByStatus: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  totalEntitiesExtracted: number;
  totalTokensUsed: number;
  totalEstimatedCostUsd: number;
}
