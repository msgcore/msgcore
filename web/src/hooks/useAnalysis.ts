import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';

export interface CreateEntitySchemaDto {
  name: string;
  description?: string;
  properties: Record<string, any>;
  prompt?: string;
  model?: string;
  temperature?: number;
}

export function useEntitySchemas(projectId?: string) {
  return useQuery({
    queryKey: ['entitySchemas', projectId],
    queryFn: () => sdk.analysisSchemas.list({ project: projectId }),
    enabled: !!projectId,
  });
}

export function useEntitySchema(projectId?: string, schemaId?: string) {
  return useQuery({
    queryKey: ['entitySchema', projectId, schemaId],
    queryFn: () => sdk.analysisSchemas.get(schemaId!, { project: projectId }),
    enabled: !!projectId && !!schemaId,
  });
}

export function useCreateEntitySchema(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntitySchemaDto) =>
      sdk.analysisSchemas.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitySchemas', projectId] });
    },
  });
}

export function useUpdateEntitySchema(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schemaId, ...data }: Partial<CreateEntitySchemaDto> & { schemaId: string }) =>
      sdk.analysisSchemas.update(schemaId, { ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitySchemas', projectId] });
    },
  });
}

export function useDeleteEntitySchema(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schemaId: string) =>
      sdk.analysisSchemas.delete(schemaId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitySchemas', projectId] });
    },
  });
}

// ============================================
// Models
// ============================================

export interface ModelResponse {
  id: string;
  name: string;
  description?: string;
}

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => sdk.analysisModels.list(),
    staleTime: 3600000, // 1 hour (matches backend cache)
  });
}

// ============================================
// Analysis Profiles
// ============================================

export interface CreateAnalysisProfileDto {
  name: string;
  description?: string;
  version?: number;
  graphDefinition: Record<string, any>;
  entitySchemaIds: string[];
  triggerOnReceive?: boolean;
  triggerOnSchedule?: string;
  triggerOnDemand?: boolean;
  storeEntities?: boolean;
  generateTags?: boolean;
}

export function useAnalysisProfiles(projectId?: string) {
  return useQuery({
    queryKey: ['analysisProfiles', projectId],
    queryFn: () => sdk.analysisProfiles.list({ project: projectId }),
    enabled: !!projectId,
  });
}

export function useAnalysisProfile(projectId?: string, profileId?: string) {
  return useQuery({
    queryKey: ['analysisProfile', projectId, profileId],
    queryFn: () => sdk.analysisProfiles.get(profileId!, { project: projectId }),
    enabled: !!projectId && !!profileId,
  });
}

export function useCreateAnalysisProfile(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnalysisProfileDto) =>
      sdk.analysisProfiles.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysisProfiles', projectId] });
    },
  });
}

export function useUpdateAnalysisProfile(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, ...data }: Partial<CreateAnalysisProfileDto> & { profileId: string }) =>
      sdk.analysisProfiles.update(profileId, { ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysisProfiles', projectId] });
    },
  });
}

export function useDeleteAnalysisProfile(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) =>
      sdk.analysisProfiles.delete(profileId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysisProfiles', projectId] });
    },
  });
}

// ============================================
// Analysis Runs
// ============================================

export interface CreateAnalysisRunDto {
  profileId: string;
  chatIds?: string[];
  identityIds?: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export function useAnalysisRuns(
  projectId?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  return useQuery({
    queryKey: ['analysisRuns', projectId, sortBy, sortOrder],
    queryFn: () => sdk.analysisRuns.list({ project: projectId, sortBy, sortOrder }),
    enabled: !!projectId,
  });
}

export function useAnalysisRun(projectId?: string, runId?: string) {
  return useQuery({
    queryKey: ['analysisRun', projectId, runId],
    queryFn: () => sdk.analysisRuns.get(runId!, { project: projectId }),
    enabled: !!projectId && !!runId,
    refetchInterval: (data: any) => {
      // Refetch every 2 seconds if run is still in progress
      if (data?.status === 'pending' || data?.status === 'running') {
        return 2000;
      }
      return false;
    },
  });
}

export function useCreateAnalysisRun(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnalysisRunDto) =>
      sdk.analysisRuns.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysisRuns', projectId] });
    },
  });
}

export function useCancelAnalysisRun(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) =>
      sdk.analysisRuns.cancel(runId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysisRuns', projectId] });
    },
  });
}

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

export function useAnalysisStats(projectId?: string) {
  return useQuery({
    queryKey: ['analysisStats', projectId],
    queryFn: () => sdk.analysisRuns.stats({ project: projectId }),
    enabled: !!projectId,
  });
}

// ============================================
// Extracted Entities
// ============================================

export interface ExtractedEntityResponse {
  id: string;
  projectId: string;
  entitySchemaId: string;
  entitySchemaName: string;
  runId: string;
  profileVersion: number;
  properties: Record<string, any>;
  identityId: string | null;
  chatId: string | null;
  sourceMessageIds: string[];
  isLatest: boolean;
  confidence: number | null;
  extractedAt: string;
}

export function useExtractedEntities(
  projectId?: string,
  filters?: {
    runId?: string;
    schemaId?: string;
    chatId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  return useQuery({
    queryKey: ['extractedEntities', projectId, filters],
    queryFn: () => sdk.analysisEntities.list({ project: projectId, ...filters }),
    enabled: !!projectId,
  });
}
