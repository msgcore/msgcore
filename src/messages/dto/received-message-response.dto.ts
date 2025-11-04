export class ReceivedMessageResponse {
  id: string;
  platform: string;
  providerMessageId: string;
  providerChatId: string;
  providerUserId: string;
  userDisplay: string | null;
  messageText: string | null;
  messageType: string;
  timestamp: Date; // Unified field (was receivedAt)
  direction: string; // 'sent' | 'received'
  source: string; // 'api' | 'phone' | 'webhook'
  rawData: any;
  platformConfig?: {
    id: string;
    platform: string;
    isActive: boolean;
    testMode: boolean;
  };
}
