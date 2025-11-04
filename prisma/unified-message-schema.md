# Unified Message Schema Design

## Clean Schema (No Legacy)

```prisma
model Message {
  id                String              @id @default(uuid())

  // Core identification
  projectId         String              @map("project_id")
  platformId        String              @map("platform_id")
  chatId            String              @map("chat_id")

  // Direction & source
  direction         MessageDirection    // 'sent' | 'received'
  source            MessageSource       // 'api' | 'phone' | 'webhook'

  // Provider identifiers
  providerMessageId String?             @map("provider_message_id")
  providerChatId    String              @map("provider_chat_id")
  providerUserId    String              @map("provider_user_id")

  // User display (for received messages from others)
  userDisplay       String?             @map("user_display")

  // Message content
  messageText       String?             @map("message_text") @db.Text
  messageType       String              @default("text") @map("message_type")
  messageContent    Json?               @map("message_content")

  // Timing (single timestamp)
  timestamp         DateTime            @default(now())

  // Sent message specific (nullable for received)
  jobId             String?             @unique @map("job_id")
  status            MessageStatus?      // null for received, required for sent
  errorMessage      String?             @map("error_message") @db.Text

  // Raw provider data
  rawData           Json?               @map("raw_data")

  // Relations
  chat              Chat                @relation(fields: [chatId], references: [id], onDelete: Cascade)
  platformConfig    ProjectPlatform     @relation(fields: [platformId], references: [id], onDelete: Cascade)
  project           Project             @relation(fields: [projectId], references: [id], onDelete: Cascade)
  attachments       MessageAttachment[]
  reactions         ReceivedReaction[]

  // Indexes
  @@unique([platformId, providerMessageId])  // Prevent duplicates from webhooks
  @@index([chatId, timestamp(sort: Desc)])   // Chat message list (primary query)
  @@index([projectId, timestamp])
  @@index([platformId, timestamp])
  @@index([providerChatId])
  @@index([providerUserId])
  @@index([direction])
  @@index([source])
  @@index([status])                          // For sent message queries
  @@index([jobId])                           // For job status lookups

  @@map("messages")
}

enum MessageDirection {
  sent
  received
}

enum MessageSource {
  api      // Sent via POST /messages/send
  phone    // Sent from user's phone (detected via webhook)
  webhook  // Received from platform webhook
}

enum MessageStatus {
  queued    // In Bull queue, not yet sent
  sent      // Sent to provider, awaiting confirmation
  delivered // Provider confirmed delivery
  failed    // Send failed
}
```

## Migration Strategy

### Fields Mapping

**From ReceivedMessage:**
- `id` → `id`
- `projectId` → `projectId`
- `platformId` → `platformId`
- `chatId` → `chatId`
- `platform` → **REMOVED** (redundant with platformConfig.platform)
- `providerMessageId` → `providerMessageId`
- `providerChatId` → `providerChatId`
- `providerUserId` → `providerUserId`
- `userDisplay` → `userDisplay`
- `messageText` → `messageText`
- `messageType` → `messageType`
- `fromMe` → **REMOVED** (use direction='sent' + source='phone')
- `rawData` → `rawData`
- `receivedAt` → `timestamp`
- `direction` → **NEW** = 'received'
- `source` → **NEW** = 'webhook'

**From SentMessage:**
- `id` → `id`
- `projectId` → `projectId`
- `platformId` → `platformId`
- `platform` → **REMOVED**
- `targetChatId` → `providerChatId` (rename for consistency)
- `targetUserId` → `providerUserId` (rename for consistency)
- `targetType` → **REMOVED** (inferred from providerChatId format)
- `jobId` → `jobId`
- `providerMessageId` → `providerMessageId`
- `messageText` → `messageText`
- `messageContent` → `messageContent`
- `status` → `status`
- `source` → `source`
- `errorMessage` → `errorMessage`
- `sentAt` → `timestamp`
- `createdAt` → **REMOVED** (use timestamp)
- `direction` → **NEW** = 'sent'
- `chatId` → **NEW** = lookup from Chat table by providerChatId

**MessageAttachment:**
- Just change foreign key from `ReceivedMessage` to `Message`
- Works for both sent and received messages now

**ReceivedReaction:**
- Add `messageId` FK relation
- Keep `providerMessageId` for now (can query either way)

## Benefits

1. **Single timestamp field** - No more `sentAt` vs `receivedAt` confusion
2. **No redundant platform field** - Use relation instead
3. **Chat messages query** - Simple: `WHERE chatId = ? ORDER BY timestamp DESC LIMIT 50`
4. **Proper reactions** - Works for sent and received messages
5. **Proper attachments** - Works for sent and received messages
6. **Clean enums** - Type-safe direction, source, and status

## Breaking Changes

- All code referencing `ReceivedMessage` or `SentMessage` must update
- `fromMe` field removed (use `direction === 'sent' && source === 'phone'`)
- `receivedAt` / `sentAt` replaced with single `timestamp`
- Frontend already handles this (we just fixed it!)
