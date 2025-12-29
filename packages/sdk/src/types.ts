// Generated TypeScript types for MsgCore SDK
// DO NOT EDIT - This file is auto-generated from backend contracts

export interface AcceptInviteDto {
  token: string;
  name: string;
  password: string;
}

export interface AddAliasDto {
  platformId: string;
  providerUserId: string;
  providerUserDisplay?: string;
}

export interface AddMemberDto {
  email: string;
  role: ProjectRole;
}

export interface AnalysisProfileResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: number;
  graphDefinition: Record<string, any>;
  entitySchemaIds: string[];
  storeEntities: boolean;
  generateTags: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRunResponse {
  id: string;
  projectId: string;
  profileId: string;
  profileVersion: number;
  chatIds?: string[];
  identityIds?: string[];
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  status: string;
  progress: number;
  entitiesExtracted: number;
  errorMessage?: string;
  tokensUsed?: number;
  estimatedCostUsd?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface AnalysisStatsResponse {
  totalRuns: number;
  runsByStatus: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  totalEntitiesExtracted: number;
  totalTokensUsed: number;
  totalEstimatedCostUsd: number;
}

export interface ApiKeyListResponse {
  id: string;
  name: string;
  maskedKey: string;
  scopes: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface ApiKeyResponse {
  id: string;
  key: string;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt: Date | null;
  createdAt: Date;
}

export interface ApiKeyRollResponse {
  id: string;
  key: string;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt: Date | null;
  createdAt: Date;
  oldKeyRevokedAt: Date;
}

export interface AttachmentDto {
  url?: string;
  data?: string;
  filename?: string;
  mimeType?: string;
  caption?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    isAdmin: boolean;
  };
}

export interface ButtonDto {
  text: string;
  value?: string;
  url?: string;
  style?: ButtonStyle;
}

export type ButtonStyle = 'primary' | 'secondary' | 'success' | 'danger' | 'link';

export type ChatType = 'user' | 'group' | 'channel';

export interface CheckoutResponseDto {
  sessionId: string;
  url: string;
}

export interface ContentDto {
  subject?: string;
  text?: string;
  markdown?: string;
  html?: string;
  attachments?: AttachmentDto[];
  buttons?: ButtonDto[];
  embeds?: EmbedDto[];
  platformOptions?: Record<string, any>;
}

export interface CreateAnalysisProfileDto {
  name: string;
  description?: string;
  version?: number;
  graphDefinition: Record<string, any>;
  entitySchemaIds: string[];
  storeEntities?: boolean;
  generateTags?: boolean;
}

export interface CreateAnalysisRunDto {
  profileId: string;
  chatIds?: string[];
  identityIds?: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface CreateApiKeyDto {
  name: string;
  scopes: string[];
  expiresInDays?: number;
}

export interface CreateCheckoutDto {
  tier: SubscriptionTier;
  interval: 'monthly' | 'annual';
}

export interface CreateEntitySchemaDto {
  name: string;
  description?: string;
  extractionType: ExtractionType;
  properties: Record<string, any>;
  prompt?: string;
  model?: string;
  temperature?: number;
  ruleDefinition?: Record<string, any>;
}

export interface CreateIdentityDto {
  displayName?: string;
  email?: string;
  metadata?: Record<string, any>;
  aliases: IdentityAliasDto[];
}

export interface CreateInviteDto {
  email: string;
}

export interface CreatePlatformDto {
  platform: PlatformType;
  id?: string;
  name: string;
  description?: string;
  credentials: Record<string, any>;
  isActive?: boolean;
  testMode?: boolean;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  id?: string;
  environment?: ProjectEnvironment;
  isDefault?: boolean;
  settings?: any;
}

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: WebhookEventType[];
  secret?: string;
}

export interface EmbedAuthorDto {
  name: string;
  url?: string;
  iconUrl?: string;
}

export interface EmbedDto {
  title?: string;
  description?: string;
  color?: string;
  url?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  author?: EmbedAuthorDto;
  footer?: EmbedFooterDto;
  timestamp?: string;
  fields?: EmbedFieldDto[];
}

export interface EmbedFieldDto {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedFooterDto {
  text: string;
  iconUrl?: string;
}

export interface EntitySchemaResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  extractionType: ExtractionType;
  properties: Record<string, any>;
  prompt?: string;
  model?: string;
  temperature?: number;
  ruleDefinition?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractedEntityResponse {
  id: string;
  projectId: string;
  entitySchemaId: string;
  entitySchemaName: string;
  runId: string;
  profileVersion: number;
  properties: Record<string, any>;
  identityId: string | null;
  chatId: string | null;
  sourceMessageIds: string[];
  isLatest: boolean;
  confidence: number | null;
  extractedAt: Date;
}

export type ExtractionType = 'llm_extraction' | 'rule_based' | 'api_logged';

export interface IdentityAliasDto {
  platformId: string;
  providerUserId: string;
  providerUserDisplay?: string;
}

export interface IdentityAliasResponse {
  id: string;
  identityId: string;
  projectId: string;
  platformId: string;
  platform: string;
  providerUserId: string;
  providerUserDisplay: string | null;
  linkedAt: Date;
  linkMethod: 'manual' | 'automatic';
}

export interface IdentityResponse {
  id: string;
  projectId: string;
  displayName: string | null;
  email: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  aliases: IdentityAliasResponse[];
}

export interface InviteResponse {
  inviteLink: string;
  email: string;
  expiresAt: Date;
}

export interface ListChatsDto {
  platformId?: string;
  chatType?: ChatType;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface MessageListResponse {
  messages: ReceivedMessageResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface MessageResponse {
  message: string;
}

export interface MessageRetryResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface MessageSendResponse {
  success: boolean;
  jobId: string;
  status: string;
  targets: Array<{
    platformId: string;
    type: string;
    id: string;
  }>;
  platformIds: string[];
  timestamp: string;
  message: string;
}

export interface MessageStatsResponse {
  received: {
    totalMessages: number;
    recentMessages: number;
    uniqueUsers: number;
    uniqueChats: number;
    byPlatform: Array<{
      platform: string;
      count: number;
    }>;
  };
  sent: {
    totalMessages: number;
    byPlatformAndStatus: Array<{
      platform: string;
      status: string;
      count: number;
    }>;
  };
}

export interface MessageStatusResponse {
  jobId: string;
  status: string;
  progress?: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface MetadataDto {
  trackingId?: string;
  tags?: string[];
  priority?: Priority;
}

export interface ModelResponse {
  id: string;
  name: string;
  description?: string;
}

export interface OptionsDto {
  replyTo?: string;
  silent?: boolean;
  scheduled?: string;
}

export interface PermissionResponse {
  authType: 'api-key' | 'jwt';
  permissions: string[];
  project?: {
    id: string;
    name: string;
  };
  user?: {
    userId: string;
    email?: string;
    name?: string;
  };
  apiKey?: {
    id: string;
    name: string;
  };
}

export interface PlatformLogResponse {
  id: string;
  projectId: string;
  platformId?: string;
  platform: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'connection' | 'webhook' | 'message' | 'error' | 'auth' | 'general';
  message: string;
  metadata?: Record<string, any>;
  error?: string;
  timestamp: string;
  platformConfig?: {
    id: string;
    platform: string;
    isActive: boolean;
  };
}

export interface PlatformLogsResponse {
  logs: PlatformLogResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface PlatformLogStatsResponse {
  summary: Array<{
    level: string;
    category: string;
    count: number;
  }>;
  recentErrors: Array<{
    message: string;
    category: string;
    timestamp: string;
    platform: string;
  }>;
}

export interface PlatformResponse {
  id: string;
  platform: string;
  isActive: boolean;
  testMode: boolean;
  webhookUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PlatformType = 'discord' | 'telegram' | 'whatsapp-evo' | 'whatsapp-baileys' | 'email';

export interface PortalResponseDto {
  url: string;
}

export type Priority = 'low' | 'normal' | 'high';

export type ProjectEnvironment = 'development' | 'staging' | 'production';

export interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  environment: 'development' | 'staging' | 'production';
  isDefault: boolean;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _count?: {
    apiKeys: number;
  };
}

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface QueryMessagesDto {
  platformId?: string;
  chatId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  raw?: boolean;
  reactions?: boolean;
  direction?: 'sent' | 'received';
}

export interface QuickLinkDto {
  platformId: string;
  providerUserId: string;
  providerUserDisplay?: string;
  displayName?: string;
  email?: string;
}

export interface ReceivedMessageResponse {
  id: string;
  platform: string;
  providerMessageId: string;
  providerChatId: string;
  providerUserId: string;
  userDisplay: string | null;
  messageText: string | null;
  messageType: string;
  timestamp: Date;
  direction: string;
  source: string;
  rawData: any;
  platformConfig?: {
    id: string;
    platform: string;
    isActive: boolean;
    testMode: boolean;
  };
}

export interface ReceivedReactionResponse {
  id: string;
  projectId: string;
  platformId: string;
  platform: string;
  providerMessageId: string;
  providerChatId: string;
  providerUserId: string;
  userDisplay: string | null;
  emoji: string;
  reactionType: 'added' | 'removed';
  rawData: Record<string, any>;
  timestamp: Date;
}

export interface ResourceUsage {
  current: number;
  limit: number;
  usagePercent: number;
  isApproachingLimit: boolean;
  isAtLimit: boolean;
  nextTier?: string;
}

export interface SendMessageDto {
  target: string;
  text?: string;
  content?: ContentDto;
  options?: OptionsDto;
  metadata?: MetadataDto;
}

export interface SendReactionDto {
  platformId: string;
  messageId: string;
  emoji: string;
}

export interface SignupDto {
  email: string;
  password: string;
  name?: string;
}

export interface SubscriptionResponseDto {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startedAt: Date | null;
  endsAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  isTrialing: boolean;
  daysUntilEnd: number | null;
}

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export interface SupportedPlatformsResponse {
  platforms: Array<{
    name: string;
    displayName: string;
    connectionType: string;
    features: {
      supportsWebhooks: boolean;
      supportsPolling: boolean;
      supportsWebSocket: boolean;
    };
    capabilities: Array<{
      capability: string;
      limitations?: string;
    }>;
    credentials: {
      required: string[];
      optional: string[];
      example: Record<string, any>;
    } | null;
  }>;
}

export interface SyncHistoryDto {
  platformId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface SyncResponseDto {
  synced: boolean;
}

export interface UpdateAnalysisProfileDto {
  name?: string;
  description?: string;
  graphDefinition?: Record<string, any>;
  entitySchemaIds?: string[];
  storeEntities?: boolean;
  generateTags?: boolean;
}

export interface UpdateChatDto {
  name?: string;
  avatarUrl?: string;
  metadata?: any;
}

export interface UpdateEntitySchemaDto {
  name?: string;
  description?: string;
  extractionType?: 'llm_extraction' | 'rule_based' | 'api_logged';
  properties?: Record<string, any>;
  prompt?: string;
  model?: string;
  temperature?: number;
  ruleDefinition?: Record<string, any>;
}

export interface UpdateIdentityDto {
  displayName?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMemberRoleDto {
  role: ProjectRole;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePlatformDto {
  name?: string;
  description?: string;
  credentials?: Record<string, any>;
  isActive?: boolean;
  testMode?: boolean;
}

export interface UpdateProfileDto {
  name?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  id?: string;
  environment?: ProjectEnvironment;
  isDefault?: boolean;
  settings?: any;
}

export interface UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: WebhookEventType[];
  isActive?: boolean;
}

export interface UsageResponseDto {
  tier: SubscriptionTier;
  projects: ResourceUsage;
  platforms: ResourceUsage;
  messages: ResourceUsage;
  webhooks: ResourceUsage;
  teamMembers: ResourceUsage;
  warnings: string[];
}

export interface WebhookDeliveryListResponse {
  deliveries: WebhookDeliveryResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface WebhookDeliveryResponse {
  id: string;
  event: WebhookEventType;
  status: 'pending' | 'success' | 'failed';
  responseCode: number | null;
  error: string | null;
  attempts: number;
  deliveredAt: Date | null;
  createdAt: Date;
  payload: Record<string, unknown>;
}

export interface WebhookDetailResponse {
  stats: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: string;
  };
}

export type WebhookEventType = 'message.received' | 'message.sent' | 'message.failed' | 'button.clicked' | 'reaction.added' | 'reaction.removed';

export interface WebhookResponse {
  id: string;
  projectId: string;
  name: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  message?: string;
}

/**
 * Platform-specific options for Email (SMTP)
 * Auto-generated from EmailPlatformOptions
 */
export interface EmailPlatformOptions {
  /** CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email */
  cc?: string[];
  /** BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing */
  bcc?: string[];
  /** Reply-To address Email address where replies should be sent (different from sender) */
  replyTo?: string;
  /** Custom SMTP headers Advanced: Add custom headers to the email */
  headers?: Record<string, string>;
}

/**
 * Platform-specific options for all supported platforms
 * Use this in platformOptions field when sending messages
 */
export interface PlatformOptions {
  email?: EmailPlatformOptions;
}

// SDK configuration
export interface MsgCoreConfig {
  apiUrl: string;
  apiKey?: string;
  jwtToken?: string;
  getToken?: () => string | null; // Dynamic token getter (preferred over jwtToken)
  defaultProject?: string;
  timeout?: number;
  retries?: number;
}
