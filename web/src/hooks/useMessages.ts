import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { QueryMessagesDto, SendMessageDto } from '@msgcore/sdk';

// List received messages
export function useMessages(projectId?: string, filters?: QueryMessagesDto) {
  return useQuery({
    queryKey: ['messages', projectId, filters],
    queryFn: () => sdk.messages.list({ ...filters, project: projectId }),
    enabled: !!projectId,
  });
}

// Get message statistics
export function useMessageStats(projectId?: string) {
  return useQuery({
    queryKey: ['message-stats', projectId],
    queryFn: () => sdk.messages.stats({ project: projectId }),
    enabled: !!projectId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Get specific message
export function useMessage(messageId: string, projectId?: string) {
  return useQuery({
    queryKey: ['message', messageId, projectId],
    queryFn: () => sdk.messages.get(messageId, { project: projectId }),
    enabled: !!messageId && !!projectId,
  });
}

// Send message
export function useSendMessage(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageDto) =>
      sdk.messages.send({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
      queryClient.invalidateQueries({ queryKey: ['message-stats', projectId] });
    },
  });
}

// Check message status
export function useMessageStatus(jobId: string, projectId?: string) {
  return useQuery({
    queryKey: ['message-status', jobId, projectId],
    queryFn: () => sdk.messages.status(jobId, { project: projectId }),
    enabled: !!jobId && !!projectId,
    refetchInterval: (data) => {
      // Stop polling if message is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
}

// Retry failed message
export function useRetryMessage(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      sdk.messages.retry(jobId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
    },
  });
}

// Cleanup old messages
export function useCleanupMessages(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sdk.messages.cleanup({ project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
      queryClient.invalidateQueries({ queryKey: ['message-stats', projectId] });
    },
  });
}

// Add reaction
export function useAddReaction(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { platformId: string; messageId: string; emoji: string }) =>
      sdk.messages.react({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
    },
  });
}

// Remove reaction
export function useRemoveReaction(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { platformId: string; messageId: string; emoji: string }) =>
      sdk.messages.unreact({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
    },
  });
}
