import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { CreatePlatformDto, UpdatePlatformDto } from '@msgcore/sdk';

export function usePlatforms(projectId?: string) {
  return useQuery({
    queryKey: ['platforms', projectId],
    queryFn: () => sdk.platforms.list({ project: projectId }),
    enabled: !!projectId,
  });
}

export function useConfigurePlatform(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlatformDto) =>
      sdk.platforms.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms', projectId] });
    },
  });
}

export function useUpdatePlatform(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ platformId, ...data }: { platformId: string } & UpdatePlatformDto) =>
      sdk.platforms.update(platformId, { ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms', projectId] });
    },
  });
}

export function useDeletePlatform(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platformId: string) =>
      sdk.platforms.delete(platformId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms', projectId] });
    },
  });
}

export function useRegisterWebhook(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platformId: string) =>
      sdk.platforms.registerWebhook(platformId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms', projectId] });
    },
  });
}

export function usePlatformQRCode(platformId: string, projectId?: string) {
  return useQuery({
    queryKey: ['platform-qr', platformId, projectId],
    queryFn: () => sdk.platforms.getQrCode(platformId, { project: projectId }),
    enabled: !!platformId && !!projectId,
  });
}

// Get supported platforms information
export function useSupportedPlatforms() {
  return useQuery({
    queryKey: ['supported-platforms'],
    queryFn: () => sdk.platforms.supported(),
  });
}