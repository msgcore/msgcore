import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { CreateProjectDto, UpdateProjectDto } from '@msgcore/sdk';
import { useAuth } from '../contexts/AuthContext';

export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects'],
    queryFn: () => sdk.projects.list(),
    enabled: !!user, // Only fetch when user is authenticated
  });
}

export function useProject(projectId?: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => sdk.projects.get({ project: projectId }),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => sdk.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, ...data }: { projectId: string } & UpdateProjectDto) => {
      return sdk.projects.update({ ...data, project: projectId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => sdk.projects.delete({ project: projectId }),
    onSuccess: (_, projectId) => {
      // Invalidate the projects list to refresh it
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Also invalidate the specific project query
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}