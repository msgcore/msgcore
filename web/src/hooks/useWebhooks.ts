import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { CreateWebhookDto, UpdateWebhookDto } from '@msgcore/sdk';

// List webhooks
export function useWebhooks(projectId?: string) {
  return useQuery({
    queryKey: ['webhooks', projectId],
    queryFn: () => sdk.webhooks.list({ project: projectId }),
    enabled: !!projectId,
  });
}

// Get webhook details with stats
export function useWebhook(webhookId: string, projectId?: string) {
  return useQuery({
    queryKey: ['webhook', webhookId, projectId],
    queryFn: () => sdk.webhooks.get(webhookId, { project: projectId }),
    enabled: !!webhookId && !!projectId,
  });
}

// Create webhook
export function useCreateWebhook(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookDto) =>
      sdk.webhooks.create({ ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', projectId] });
    },
  });
}

// Update webhook
export function useUpdateWebhook(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ webhookId, ...data }: { webhookId: string } & UpdateWebhookDto) =>
      sdk.webhooks.update(webhookId, { ...data, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', projectId] });
    },
  });
}

// Delete webhook
export function useDeleteWebhook(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (webhookId: string) =>
      sdk.webhooks.delete(webhookId, { project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', projectId] });
    },
  });
}

// Get webhook deliveries
export function useWebhookDeliveries(webhookId: string, projectId?: string) {
  return useQuery({
    queryKey: ['webhook-deliveries', webhookId, projectId],
    queryFn: () => sdk.webhooks.deliveries(webhookId, { project: projectId }),
    enabled: !!webhookId && !!projectId,
  });
}
