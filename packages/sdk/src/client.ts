// Generated API client for MsgCore SDK
// DO NOT EDIT - This file is auto-generated from backend contracts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AcceptInviteDto,
  AddAliasDto,
  AddMemberDto,
  AnalysisProfileResponse,
  AnalysisRunResponse,
  AnalysisStatsResponse,
  ApiKeyListResponse,
  ApiKeyResponse,
  ApiKeyRollResponse,
  AuthResponse,
  CheckoutResponseDto,
  CreateAnalysisProfileDto,
  CreateAnalysisRunDto,
  CreateApiKeyDto,
  CreateCheckoutDto,
  CreateEntitySchemaDto,
  CreateIdentityDto,
  CreateInviteDto,
  CreatePlatformDto,
  CreateProjectDto,
  CreateWebhookDto,
  EntitySchemaResponse,
  ExtractedEntityResponse,
  IdentityAliasResponse,
  IdentityResponse,
  InviteResponse,
  ListChatsDto,
  LoginDto,
  MessageListResponse,
  MessageResponse,
  MessageRetryResponse,
  MessageSendResponse,
  MessageStatsResponse,
  MessageStatusResponse,
  ModelResponse,
  MsgCoreConfig,
  PermissionResponse,
  PlatformLogStatsResponse,
  PlatformLogsResponse,
  PlatformResponse,
  PortalResponseDto,
  ProjectMemberResponse,
  ProjectResponse,
  QueryMessagesDto,
  QuickLinkDto,
  ReceivedMessageResponse,
  ReceivedReactionResponse,
  SendMessageDto,
  SendReactionDto,
  SignupDto,
  SubscriptionResponseDto,
  SupportedPlatformsResponse,
  SyncHistoryDto,
  SyncResponseDto,
  UpdateAnalysisProfileDto,
  UpdateChatDto,
  UpdateEntitySchemaDto,
  UpdateIdentityDto,
  UpdateMemberRoleDto,
  UpdatePasswordDto,
  UpdatePlatformDto,
  UpdateProfileDto,
  UpdateProfileResponse,
  UpdateProjectDto,
  UpdateWebhookDto,
  UsageResponseDto,
  WebhookDeliveryListResponse,
  WebhookDetailResponse,
  WebhookResponse
} from './types.js';
import { MsgCoreError, AuthenticationError, RateLimitError } from './errors.js';

class AnalysisEntitiesAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async list(options?: { project?: string }): Promise<ExtractedEntityResponse[]> {
    const response = await this.client.get<ExtractedEntityResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/entities`);
    return response.data;
  }

  async get(id: string, options?: { project?: string }): Promise<ExtractedEntityResponse> {
    const response = await this.client.get<ExtractedEntityResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/entities/${id}`);
    return response.data;
  }
}

class AnalysisModelsAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async list(): Promise<ModelResponse[]> {
    const response = await this.client.get<ModelResponse[]>(`/api/v1/analysis/models`);
    return response.data;
  }
}

class AnalysisProfilesAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreateAnalysisProfileDto & { project?: string }): Promise<AnalysisProfileResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<AnalysisProfileResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/profiles`, data);
    return response.data;
  }

  async list(options?: { project?: string }): Promise<AnalysisProfileResponse[]> {
    const response = await this.client.get<AnalysisProfileResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/profiles`);
    return response.data;
  }

  async get(profileId: string, options?: { project?: string }): Promise<AnalysisProfileResponse> {
    const response = await this.client.get<AnalysisProfileResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/profiles/${profileId}`);
    return response.data;
  }

  async update(profileId: string, options: UpdateAnalysisProfileDto & { project?: string }): Promise<AnalysisProfileResponse> {
    const { project, ...data } = options;
    const response = await this.client.patch<AnalysisProfileResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/profiles/${profileId}`, data);
    return response.data;
  }

  async delete(profileId: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/profiles/${profileId}`);
    return response.data;
  }
}

class AnalysisRunsAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreateAnalysisRunDto & { project?: string }): Promise<AnalysisRunResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<AnalysisRunResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/runs`, data);
    return response.data;
  }

  async stats(options?: { project?: string }): Promise<AnalysisStatsResponse> {
    const response = await this.client.get<AnalysisStatsResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/runs/stats`);
    return response.data;
  }

  async list(options?: { project?: string }): Promise<AnalysisRunResponse[]> {
    const response = await this.client.get<AnalysisRunResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/runs`);
    return response.data;
  }

  async get(runId: string, options?: { project?: string }): Promise<AnalysisRunResponse> {
    const response = await this.client.get<AnalysisRunResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/runs/${runId}`);
    return response.data;
  }

  async cancel(runId: string, options?: { project?: string }): Promise<AnalysisRunResponse> {
    const response = await this.client.post<AnalysisRunResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/runs/${runId}/cancel`);
    return response.data;
  }
}

class AnalysisSchemasAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreateEntitySchemaDto & { project?: string }): Promise<EntitySchemaResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<EntitySchemaResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/schemas/entities`, data);
    return response.data;
  }

  async list(options: Record<string, any> & { project?: string }): Promise<EntitySchemaResponse[]> {
    const { project, ...data } = options;
    const response = await this.client.get<EntitySchemaResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/schemas/entities`, { params: data });
    return response.data;
  }

  async get(schemaId: string, options: Record<string, any> & { project?: string }): Promise<EntitySchemaResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<EntitySchemaResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/schemas/entities/${schemaId}`, { params: data });
    return response.data;
  }

  async update(schemaId: string, options: UpdateEntitySchemaDto & { project?: string }): Promise<EntitySchemaResponse> {
    const { project, ...data } = options;
    const response = await this.client.patch<EntitySchemaResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/schemas/entities/${schemaId}`, data);
    return response.data;
  }

  async delete(schemaId: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/analysis/schemas/entities/${schemaId}`);
    return response.data;
  }
}

class ApikeysAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreateApiKeyDto & { project?: string }): Promise<ApiKeyResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<ApiKeyResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/keys`, data);
    return response.data;
  }

  async list(options?: { project?: string }): Promise<ApiKeyListResponse[]> {
    const response = await this.client.get<ApiKeyListResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/keys`);
    return response.data;
  }

  async revoke(keyId: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/keys/${keyId}`);
    return response.data;
  }

  async roll(keyId: string, options?: { project?: string }): Promise<ApiKeyRollResponse> {
    const response = await this.client.post<ApiKeyRollResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/keys/${keyId}/roll`);
    return response.data;
  }
}

class AuthAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async signup(options: SignupDto): Promise<AuthResponse> {
    const data = options;
    const response = await this.client.post<AuthResponse>(`/api/v1/auth/signup`, data);
    return response.data;
  }

  async login(options: LoginDto): Promise<AuthResponse> {
    const data = options;
    const response = await this.client.post<AuthResponse>(`/api/v1/auth/login`, data);
    return response.data;
  }

  async acceptInvite(options: AcceptInviteDto): Promise<AuthResponse> {
    const data = options;
    const response = await this.client.post<AuthResponse>(`/api/v1/auth/accept-invite`, data);
    return response.data;
  }

  async whoami(): Promise<PermissionResponse> {
    const response = await this.client.get<PermissionResponse>(`/api/v1/auth/whoami`);
    return response.data;
  }

  async updatePassword(options: UpdatePasswordDto): Promise<MessageResponse> {
    const data = options;
    const response = await this.client.patch<MessageResponse>(`/api/v1/auth/password`, data);
    return response.data;
  }

  async updateProfile(options: UpdateProfileDto): Promise<UpdateProfileResponse> {
    const data = options;
    const response = await this.client.patch<UpdateProfileResponse>(`/api/v1/auth/profile`, data);
    return response.data;
  }
}

class BillingAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async checkout(options: CreateCheckoutDto): Promise<CheckoutResponseDto> {
    const data = options;
    const response = await this.client.post<CheckoutResponseDto>(`/api/v1/billing/checkout`, data);
    return response.data;
  }

  async portal(): Promise<PortalResponseDto> {
    const response = await this.client.post<PortalResponseDto>(`/api/v1/billing/portal`);
    return response.data;
  }

  async subscription(): Promise<SubscriptionResponseDto> {
    const response = await this.client.get<SubscriptionResponseDto>(`/api/v1/billing/subscription`);
    return response.data;
  }

  async usage(): Promise<UsageResponseDto> {
    const response = await this.client.get<UsageResponseDto>(`/api/v1/billing/usage`);
    return response.data;
  }

  async sync(): Promise<SyncResponseDto> {
    const response = await this.client.post<SyncResponseDto>(`/api/v1/billing/sync`);
    return response.data;
  }
}

class ChatsAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async list(options: ListChatsDto & { project?: string }): Promise<any> {
    const { project, ...data } = options;
    const response = await this.client.get<any>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/chats`, { params: data });
    return response.data;
  }

  async get(chatId: string, options: Record<string, any> & { project?: string }): Promise<any> {
    const { project, ...data } = options;
    const response = await this.client.get<any>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/chats/${chatId}`, { params: data });
    return response.data;
  }

  async messages(chatId: string, options: Record<string, any> & { project?: string }): Promise<any> {
    const { project, ...data } = options;
    const response = await this.client.get<any>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/chats/${chatId}/messages`, { params: data });
    return response.data;
  }

  async update(chatId: string, options: UpdateChatDto & { project?: string }): Promise<any> {
    const { project, ...data } = options;
    const response = await this.client.patch<any>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/chats/${chatId}`, data);
    return response.data;
  }

  async syncAll(options: SyncHistoryDto & { project?: string }): Promise<any> {
    const { project, ...data } = options;
    const response = await this.client.post<any>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/chats/sync-all`, data);
    return response.data;
  }

  async sync(chatId: string, options: SyncHistoryDto & { project?: string }): Promise<any> {
    const { project, ...data } = options;
    const response = await this.client.post<any>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/chats/${chatId}/sync`, data);
    return response.data;
  }
}

class IdentitiesAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreateIdentityDto & { project?: string }): Promise<IdentityResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<IdentityResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities`, data);
    return response.data;
  }

  async list(options?: { project?: string }): Promise<IdentityResponse[]> {
    const response = await this.client.get<IdentityResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities`);
    return response.data;
  }

  async search(options: Record<string, any> & { project?: string }): Promise<IdentityResponse[]> {
    const { project, ...data } = options;
    const response = await this.client.get<IdentityResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/search`, { params: data });
    return response.data;
  }

  async quickLink(options: QuickLinkDto & { project?: string }): Promise<IdentityResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<IdentityResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/quick-link`, data);
    return response.data;
  }

  async lookup(options: Record<string, any> & { project?: string }): Promise<IdentityResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<IdentityResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/lookup`, { params: data });
    return response.data;
  }

  async get(id: string, options: Record<string, any> & { project?: string }): Promise<IdentityResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<IdentityResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/${id}`, { params: data });
    return response.data;
  }

  async update(id: string, options: UpdateIdentityDto & { project?: string }): Promise<IdentityResponse> {
    const { project, ...data } = options;
    const response = await this.client.patch<IdentityResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/${id}`, data);
    return response.data;
  }

  async addAlias(id: string, options: AddAliasDto & { project?: string }): Promise<IdentityAliasResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<IdentityAliasResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/${id}/aliases`, data);
    return response.data;
  }

  async removeAlias(id: string, aliasId: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/${id}/aliases/${aliasId}`);
    return response.data;
  }

  async delete(id: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/${id}`);
    return response.data;
  }

  async messages(id: string, options: Record<string, any> & { project?: string }): Promise<ReceivedMessageResponse[]> {
    const { project, ...data } = options;
    const response = await this.client.get<ReceivedMessageResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/${id}/messages`, { params: data });
    return response.data;
  }

  async reactions(id: string, options: Record<string, any> & { project?: string }): Promise<ReceivedReactionResponse[]> {
    const { project, ...data } = options;
    const response = await this.client.get<ReceivedReactionResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/identities/${id}/reactions`, { params: data });
    return response.data;
  }
}

class MembersAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async list(options?: { project?: string }): Promise<ProjectMemberResponse[]> {
    const response = await this.client.get<ProjectMemberResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/members`);
    return response.data;
  }

  async add(options: AddMemberDto & { project?: string }): Promise<ProjectMemberResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<ProjectMemberResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/members`, data);
    return response.data;
  }

  async update(userId: string, options: UpdateMemberRoleDto & { project?: string }): Promise<ProjectMemberResponse> {
    const { project, ...data } = options;
    const response = await this.client.patch<ProjectMemberResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/members/${userId}`, data);
    return response.data;
  }

  async remove(userId: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/members/${userId}`);
    return response.data;
  }

  async invite(options: CreateInviteDto & { project?: string }): Promise<InviteResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<InviteResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/members/invite`, data);
    return response.data;
  }
}

class MessagesAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async list(options: QueryMessagesDto & { project?: string }): Promise<MessageListResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<MessageListResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages`, { params: data });
    return response.data;
  }

  async stats(options?: { project?: string }): Promise<MessageStatsResponse> {
    const response = await this.client.get<MessageStatsResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/stats`);
    return response.data;
  }

  async get(messageId: string, options: Record<string, any> & { project?: string }): Promise<ReceivedMessageResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<ReceivedMessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/${messageId}`, { params: data });
    return response.data;
  }

  async cleanup(options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/cleanup`);
    return response.data;
  }

  async send(options: SendMessageDto & { project?: string }): Promise<MessageSendResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<MessageSendResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/send`, data);
    return response.data;
  }

  async status(jobId: string, options: Record<string, any> & { project?: string }): Promise<MessageStatusResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<MessageStatusResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/status/${jobId}`, { params: data });
    return response.data;
  }

  async retry(jobId: string, options?: { project?: string }): Promise<MessageRetryResponse> {
    const response = await this.client.post<MessageRetryResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/retry/${jobId}`);
    return response.data;
  }

  async react(options: SendReactionDto & { project?: string }): Promise<MessageResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/react`, data);
    return response.data;
  }

  async unreact(options: SendReactionDto & { project?: string }): Promise<MessageResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/messages/unreact`, data);
    return response.data;
  }
}

class PlatformLogsAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async list(options: Record<string, any> & { project?: string }): Promise<PlatformLogsResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<PlatformLogsResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/logs`, { params: data });
    return response.data;
  }

  async get(platformId: string, options: Record<string, any> & { project?: string }): Promise<PlatformLogsResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<PlatformLogsResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/${platformId}/logs`, { params: data });
    return response.data;
  }

  async stats(options?: { project?: string }): Promise<PlatformLogStatsResponse> {
    const response = await this.client.get<PlatformLogStatsResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/logs/stats`);
    return response.data;
  }
}

class PlatformsAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreatePlatformDto & { project?: string }): Promise<PlatformResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<PlatformResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms`, data);
    return response.data;
  }

  async list(options?: { project?: string }): Promise<PlatformResponse[]> {
    const response = await this.client.get<PlatformResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms`);
    return response.data;
  }

  async get(id: string, options: Record<string, any> & { project?: string }): Promise<PlatformResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<PlatformResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/${id}`, { params: data });
    return response.data;
  }

  async update(id: string, options: UpdatePlatformDto & { project?: string }): Promise<PlatformResponse> {
    const { project, ...data } = options;
    const response = await this.client.patch<PlatformResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/${id}`, data);
    return response.data;
  }

  async delete(id: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/${id}`);
    return response.data;
  }

  async registerWebhook(id: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.post<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/${id}/register-webhook`);
    return response.data;
  }

  async qrCode(id: string, options: Record<string, any> & { project?: string }): Promise<MessageResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/platforms/${id}/qr-code`, { params: data });
    return response.data;
  }

  async supported(): Promise<SupportedPlatformsResponse> {
    const response = await this.client.get<SupportedPlatformsResponse>(`/api/v1/platforms/supported`);
    return response.data;
  }
}

class ProjectsAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreateProjectDto): Promise<ProjectResponse> {
    const data = options;
    const response = await this.client.post<ProjectResponse>(`/api/v1/projects`, data);
    return response.data;
  }

  async list(): Promise<ProjectResponse[]> {
    const response = await this.client.get<ProjectResponse[]>(`/api/v1/projects`);
    return response.data;
  }

  async get(options?: { project?: string }): Promise<ProjectResponse> {
    const response = await this.client.get<ProjectResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}`);
    return response.data;
  }

  async update(options: UpdateProjectDto & { project?: string }): Promise<ProjectResponse> {
    const { project, ...data } = options;
    const response = await this.client.patch<ProjectResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}`, data);
    return response.data;
  }

  async delete(options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}`);
    return response.data;
  }
}

class WebhooksAPI {
  constructor(private client: AxiosInstance, private msgcore: MsgCore) {}

  async create(options: CreateWebhookDto & { project?: string }): Promise<WebhookResponse> {
    const { project, ...data } = options;
    const response = await this.client.post<WebhookResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/webhooks`, data);
    return response.data;
  }

  async list(options?: { project?: string }): Promise<WebhookResponse[]> {
    const response = await this.client.get<WebhookResponse[]>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/webhooks`);
    return response.data;
  }

  async get(webhookId: string, options: Record<string, any> & { project?: string }): Promise<WebhookDetailResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<WebhookDetailResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/webhooks/${webhookId}`, { params: data });
    return response.data;
  }

  async update(webhookId: string, options: UpdateWebhookDto & { project?: string }): Promise<WebhookResponse> {
    const { project, ...data } = options;
    const response = await this.client.patch<WebhookResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/webhooks/${webhookId}`, data);
    return response.data;
  }

  async delete(webhookId: string, options?: { project?: string }): Promise<MessageResponse> {
    const response = await this.client.delete<MessageResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/webhooks/${webhookId}`);
    return response.data;
  }

  async deliveries(webhookId: string, options: Record<string, any> & { project?: string }): Promise<WebhookDeliveryListResponse> {
    const { project, ...data } = options;
    const response = await this.client.get<WebhookDeliveryListResponse>(`/api/v1/projects/${options?.project || this.msgcore.getDefaultProject() || ''}/webhooks/${webhookId}/deliveries`, { params: data });
    return response.data;
  }
}

export class MsgCore {
  private client: AxiosInstance;
  private defaultProject?: string;

  // API group instances
  readonly analysisEntities: AnalysisEntitiesAPI;
  readonly analysisModels: AnalysisModelsAPI;
  readonly analysisProfiles: AnalysisProfilesAPI;
  readonly analysisRuns: AnalysisRunsAPI;
  readonly analysisSchemas: AnalysisSchemasAPI;
  readonly apikeys: ApikeysAPI;
  readonly auth: AuthAPI;
  readonly billing: BillingAPI;
  readonly chats: ChatsAPI;
  readonly identities: IdentitiesAPI;
  readonly members: MembersAPI;
  readonly messages: MessagesAPI;
  readonly platformLogs: PlatformLogsAPI;
  readonly platforms: PlatformsAPI;
  readonly projects: ProjectsAPI;
  readonly webhooks: WebhooksAPI;

  constructor(config: MsgCoreConfig) {
    this.defaultProject = config.defaultProject;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    this.setupAuthentication(config);
    this.setupErrorHandling();

    // Initialize API groups after client is ready
    this.analysisEntities = new AnalysisEntitiesAPI(this.client, this);
    this.analysisModels = new AnalysisModelsAPI(this.client, this);
    this.analysisProfiles = new AnalysisProfilesAPI(this.client, this);
    this.analysisRuns = new AnalysisRunsAPI(this.client, this);
    this.analysisSchemas = new AnalysisSchemasAPI(this.client, this);
    this.apikeys = new ApikeysAPI(this.client, this);
    this.auth = new AuthAPI(this.client, this);
    this.billing = new BillingAPI(this.client, this);
    this.chats = new ChatsAPI(this.client, this);
    this.identities = new IdentitiesAPI(this.client, this);
    this.members = new MembersAPI(this.client, this);
    this.messages = new MessagesAPI(this.client, this);
    this.platformLogs = new PlatformLogsAPI(this.client, this);
    this.platforms = new PlatformsAPI(this.client, this);
    this.projects = new ProjectsAPI(this.client, this);
    this.webhooks = new WebhooksAPI(this.client, this);
  }

  private setupAuthentication(config: MsgCoreConfig): void {
    // For dynamic tokens (browser apps) - use interceptor
    if (config.getToken) {
      this.client.interceptors.request.use((axiosConfig) => {
        const token = config.getToken!();
        if (token) {
          // Detect API keys (start with msc_) and use correct header
          if (token.startsWith('msc_')) {
            axiosConfig.headers['X-API-Key'] = token;
          } else {
            axiosConfig.headers.Authorization = `Bearer ${token}`;
          }
        }
        return axiosConfig;
      });
    }
    // For static credentials (CLI, server-side) - use defaults (faster)
    else if (config.apiKey) {
      this.client.defaults.headers['X-API-Key'] = config.apiKey;
    } else if (config.jwtToken) {
      this.client.defaults.headers['Authorization'] = `Bearer ${config.jwtToken}`;
    }
  }

  private setupErrorHandling(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new AuthenticationError('Invalid credentials');
        }
        if (error.response?.status === 429) {
          throw new RateLimitError('Rate limit exceeded');
        }
        if (error.response?.status === 403) {
          throw new MsgCoreError(
            `Insufficient permissions: ${error.response.data?.message || 'Access denied'}`,
            403,
            'INSUFFICIENT_PERMISSIONS'
          );
        }
        throw new MsgCoreError(
          error.response?.data?.message || error.message,
          error.response?.status
        );
      }
    );
  }

  getDefaultProject(): string | undefined {
    return this.defaultProject;
  }
}
