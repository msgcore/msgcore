export class SentMessageResponse {
  id: string;
  platform: string;
  jobId: string | null;
  providerMessageId: string | null;
  providerChatId: string; // Unified field (was targetChatId)
  providerUserId: string | null; // Unified field (was targetUserId)
  messageText: string | null;
  messageContent: Record<string, unknown> | null;
  status: string;
  errorMessage: string | null;
  timestamp: Date; // Unified field (was sentAt/createdAt)
  direction: string; // Always 'sent'
  source: string; // 'api' | 'phone'
}
