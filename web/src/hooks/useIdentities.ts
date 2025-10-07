import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import type {
  CreateIdentityDto,
  UpdateIdentityDto,
  AddAliasDto
} from '@msgcore/sdk/dist/types';

// List all identities
export function useIdentities(projectId?: string) {
  return useQuery({
    queryKey: ['identities', projectId],
    queryFn: () => sdk.identities.list({ project: projectId }),
    enabled: !!projectId,
  });
}

// Get single identity
export function useIdentity(identityId: string, projectId?: string) {
  return useQuery({
    queryKey: ['identity', identityId, projectId],
    queryFn: () => sdk.identities.get(identityId, { project: projectId }),
    enabled: !!identityId && !!projectId,
  });
}

// Lookup identity by platform user
export function useLookupIdentity(platformId?: string, providerUserId?: string, projectId?: string) {
  return useQuery({
    queryKey: ['identity-lookup', platformId, providerUserId, projectId],
    queryFn: () => sdk.identities.lookup({
      platformId,
      providerUserId,
      project: projectId
    } as any),
    enabled: !!platformId && !!providerUserId && !!projectId,
  });
}

// Get messages for identity
export function useIdentityMessages(identityId: string, projectId?: string) {
  return useQuery({
    queryKey: ['identity-messages', identityId, projectId],
    queryFn: () => sdk.identities.messages(identityId, { project: projectId }),
    enabled: !!identityId && !!projectId,
  });
}

// Get reactions for identity
export function useIdentityReactions(identityId: string, projectId?: string) {
  return useQuery({
    queryKey: ['identity-reactions', identityId, projectId],
    queryFn: () => sdk.identities.reactions(identityId, { project: projectId }),
    enabled: !!identityId && !!projectId,
  });
}

// Create identity
export function useCreateIdentity(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIdentityDto) =>
      sdk.identities.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities', projectId] });
    },
  });
}

// Update identity
export function useUpdateIdentity(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateIdentityDto & { id: string }) =>
      sdk.identities.update(id, { ...data, project: projectId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['identities', projectId] });
      queryClient.invalidateQueries({ queryKey: ['identity', variables.id, projectId] });
    },
  });
}

// Add alias to identity
export function useAddAlias(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ identityId, ...data }: AddAliasDto & { identityId: string }) =>
      sdk.identities.addAlias(identityId, { ...data, project: projectId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['identities', projectId] });
      queryClient.invalidateQueries({ queryKey: ['identity', variables.identityId, projectId] });
    },
  });
}

// Remove alias from identity
export function useRemoveAlias(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ identityId, aliasId }: { identityId: string; aliasId: string }) =>
      sdk.identities.removeAlias(identityId, aliasId, { project: projectId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['identities', projectId] });
      queryClient.invalidateQueries({ queryKey: ['identity', variables.identityId, projectId] });
    },
  });
}

// Delete identity
export function useDeleteIdentity(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) =>
      sdk.identities.delete(identityId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities', projectId] });
    },
  });
}
