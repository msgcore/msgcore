import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';

export interface Chat {
  id: string;
  providerChatId: string;
  chatType: 'individual' | 'group' | 'channel';
  name?: string;
  avatarUrl?: string;
  lastMessageAt?: string;
  lastSyncedAt?: string;
  messageCount: number;
  platform: {
    id: string;
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListChatsParams {
  platformId?: string;
  chatType?: 'individual' | 'group' | 'channel';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SyncHistoryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// List chats for a project
export function useChats(projectId?: string, params?: ListChatsParams) {
  return useQuery({
    queryKey: ['chats', projectId, params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.platformId) query.set('platformId', params.platformId);
      if (params?.chatType) query.set('chatType', params.chatType);
      if (params?.search) query.set('search', params.search);
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.offset) query.set('offset', params.offset.toString());

      const token = localStorage.getItem('msgcore_token');
      const response = await fetch(
        `${window.location.origin}/api/v1/projects/${projectId}/chats?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!projectId,
  });
}

// Get single chat details
export function useChat(projectId?: string, chatId?: string) {
  return useQuery({
    queryKey: ['chat', projectId, chatId],
    queryFn: async () => {
      const token = localStorage.getItem('msgcore_token');
      const response = await fetch(
        `${window.location.origin}/api/v1/projects/${projectId}/chats/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chat: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!projectId && !!chatId,
  });
}

// Get messages for a specific chat
export function useChatMessages(
  projectId?: string,
  chatId?: string,
  limit: number = 50,
  offset: number = 0,
) {
  return useQuery({
    queryKey: ['chat-messages', projectId, chatId, limit, offset],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.set('limit', limit.toString());
      query.set('offset', offset.toString());

      const token = localStorage.getItem('msgcore_token');
      const response = await fetch(
        `${window.location.origin}/api/v1/projects/${projectId}/chats/${chatId}/messages?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chat messages: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!projectId && !!chatId,
  });
}

// Update chat metadata
export function useUpdateChat(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      name,
      avatarUrl,
      metadata,
    }: {
      chatId: string;
      name?: string;
      avatarUrl?: string;
      metadata?: any;
    }) => {
      const token = localStorage.getItem('msgcore_token');
      const response = await fetch(
        `${window.location.origin}/api/v1/projects/${projectId}/chats/${chatId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, avatarUrl, metadata }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update chat: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['chat', projectId, variables.chatId] });
    },
  });
}

// Sync chat history
export function useSyncChatHistory(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      startDate,
      endDate,
      limit,
    }: {
      chatId: string;
    } & SyncHistoryParams) => {
      const token = localStorage.getItem('msgcore_token');
      const response = await fetch(
        `${window.location.origin}/api/v1/projects/${projectId}/chats/${chatId}/sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ startDate, endDate, limit }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to sync chat history: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', projectId, variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages', projectId, variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
    },
  });
}

// Sync all chats
export function useSyncAllChats(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: {
      platformId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }) => {
      const token = localStorage.getItem('msgcore_token');
      const response = await fetch(
        `${window.location.origin}/api/v1/projects/${projectId}/chats/sync-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(params || {}),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to sync all chats: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
    },
  });
}
