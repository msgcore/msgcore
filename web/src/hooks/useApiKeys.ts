import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { CreateApiKeyDto } from '@msgcore/sdk';

export function useApiKeys(projectId?: string) {
  return useQuery({
    queryKey: ['apiKeys', projectId],
    queryFn: () => sdk.apikeys.list({ project: projectId }),
    enabled: !!projectId,
  });
}

export function useCreateApiKey(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyDto) =>
      sdk.apikeys.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', projectId] });
    },
  });
}

export function useRevokeApiKey(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) =>
      sdk.apikeys.revoke(keyId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', projectId] });
    },
  });
}

export function useRollApiKey(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) =>
      sdk.apikeys.roll(keyId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', projectId] });
    },
  });
}