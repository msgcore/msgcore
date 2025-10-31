import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';

export interface CreateEntitySchemaDto {
  name: string;
  description?: string;
  extractionType: 'llm_extraction' | 'rule_based' | 'api_logged';
  properties: Record<string, any>;
  prompt?: string;
  model?: string;
  temperature?: number;
  ruleDefinition?: Record<string, any>;
}

export function useEntitySchemas(projectId?: string) {
  return useQuery({
    queryKey: ['entitySchemas', projectId],
    queryFn: () => sdk.analysis.list({ project: projectId }),
    enabled: !!projectId,
  });
}

export function useEntitySchema(projectId?: string, schemaId?: string) {
  return useQuery({
    queryKey: ['entitySchema', projectId, schemaId],
    queryFn: () => sdk.analysis.get(schemaId!, { project: projectId }),
    enabled: !!projectId && !!schemaId,
  });
}

export function useCreateEntitySchema(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntitySchemaDto) =>
      sdk.analysis.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitySchemas', projectId] });
    },
  });
}

export function useUpdateEntitySchema(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schemaId, ...data }: Partial<CreateEntitySchemaDto> & { schemaId: string }) =>
      sdk.analysis.update(schemaId, { ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitySchemas', projectId] });
    },
  });
}

export function useDeleteEntitySchema(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schemaId: string) =>
      sdk.analysis.delete(schemaId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitySchemas', projectId] });
    },
  });
}
