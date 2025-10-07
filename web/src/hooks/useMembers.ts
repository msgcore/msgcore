import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { AddMemberDto, UpdateMemberRoleDto, CreateInviteDto } from '@msgcore/sdk';

export function useMembers(projectId?: string) {
  return useQuery({
    queryKey: ['members', projectId],
    queryFn: () => sdk.members.list({ project: projectId }),
    enabled: !!projectId,
  });
}

export function useAddMember(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMemberDto) =>
      sdk.members.add({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
  });
}

export function useUpdateMemberRole(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...data }: UpdateMemberRoleDto & { userId: string }) =>
      sdk.members.update(userId, { ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
  });
}

export function useRemoveMember(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      sdk.members.remove(userId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
  });
}

export function useInviteMember(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInviteDto) =>
      sdk.members.invite({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
  });
}