export class ExtractedEntityResponse {
  id!: string;
  projectId!: string;
  entitySchemaId!: string;
  entitySchemaName!: string;
  runId!: string;
  profileVersion!: number;
  properties!: Record<string, any>;
  identityId!: string | null;
  chatId!: string | null;
  sourceMessageIds!: string[];
  isLatest!: boolean;
  confidence!: number | null;
  extractedAt!: Date;
}
