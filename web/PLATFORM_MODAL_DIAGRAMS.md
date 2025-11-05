# Platform Configuration Modal - Visual Diagrams

## Component Structure Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Platforms.tsx (Page)                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ useState: showConfigureModal, selectedPlatform, editingPlatform  │  │
│  │          configureFormData, idValidationError                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │          Section 1: Connected Platforms Card                    │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ Platform List (map over platforms)                       │   │  │
│  │  │ ├─ Platform Item 1                                       │   │  │
│  │  │ │  ├─ Icon + Name + Badge (Status)                       │   │  │
│  │  │ │  ├─ Platform ID (copy to clipboard)                    │   │  │
│  │  │ │  └─ Buttons:                                           │   │  │
│  │  │ │     ├─ [Edit] → handleEditPlatform()                   │   │  │
│  │  │ │     └─ [Delete] → handleDeletePlatform()               │   │  │
│  │  │ ├─ Platform Item 2                                       │   │  │
│  │  │ └─ Platform Item N                                       │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │        Section 2: Available Platforms Card (Grid)                │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ Platform Grid (3 columns)                                │   │  │
│  │  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │  │
│  │  │ │ Discord      │  │ Telegram     │  │ WhatsApp-Evo │   │   │  │
│  │  │ │ [Icon]       │  │ [Icon]       │  │ [Icon]       │   │   │  │
│  │  │ │ Features     │  │ Features     │  │ Features     │   │   │  │
│  │  │ │ [Add Discord]│  │ [Add Tele]   │  │ [Add WA]     │   │   │  │
│  │  │ └──────────────┘  └──────────────┘  └──────────────┘   │   │  │
│  │  │    ↓                  ↓                  ↓              │   │  │
│  │  │ handleConfigurePlatform(platform)                      │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Section 3: Platform Configuration Modal (Conditional)         │  │
│  │   {showConfigureModal && selectedPlatform && (                   │  │
│  │                                                                  │  │
│  │   ┌────────────────────────────────────────────────────────┐   │  │
│  │   │  Modal Overlay (fixed, z-50)                          │   │  │
│  │   │  ┌──────────────────────────────────────────────────┐ │   │  │
│  │   │  │  Modal Dialog (max-w-md, rounded-xl)             │ │   │  │
│  │   │  │                                                  │ │   │  │
│  │   │  │  [Title]                              [X Close]  │ │   │  │
│  │   │  │  ──────────────────────────────────────────────  │ │   │  │
│  │   │  │                                                  │ │   │  │
│  │   │  │  ┌────────────────────────────────────────────┐  │ │   │  │
│  │   │  │  │ Form Content (space-y-4)                 │  │ │   │  │
│  │   │  │  │                                           │  │ │   │  │
│  │   │  │  │ [Input: Configuration Name]              │  │ │   │  │
│  │   │  │  │   value={configureFormData.name}         │  │ │   │  │
│  │   │  │  │   onChange={(e) => setConfigureFormData} │  │ │   │  │
│  │   │  │  │                                           │  │ │   │  │
│  │   │  │  │ [Input: Platform ID] (CREATE MODE ONLY)  │  │ │   │  │
│  │   │  │  │   Auto-generated from name               │  │ │   │  │
│  │   │  │  │   User can manually edit + validate      │  │ │   │  │
│  │   │  │  │                                           │  │ │   │  │
│  │   │  │  │ [Textarea: Description]                  │  │ │   │  │
│  │   │  │  │                                           │  │ │   │  │
│  │   │  │  │ ┌─ REQUIRED FIELDS ────────────────────┐ │  │ │   │  │
│  │   │  │  │ │ {selectedPlatform.credentials        │ │  │ │   │  │
│  │   │  │  │ │  .required?.map((field) => (         │ │  │ │   │  │
│  │   │  │  │ │   <Input type={getFieldType(field)} │ │  │ │   │  │
│  │   │  │  │ │          key={field}                │ │  │ │   │  │
│  │   │  │  │ │          required={!editingPlatform}│ │  │ │   │  │
│  │   │  │  │ │   />                                │ │  │ │   │  │
│  │   │  │  │ │ ))}                                 │ │  │ │   │  │
│  │   │  │  │ └─────────────────────────────────────┘ │  │ │   │  │
│  │   │  │  │                                           │  │ │   │  │
│  │   │  │  │ ┌─ OPTIONAL FIELDS ────────────────────┐ │  │ │   │  │
│  │   │  │  │ │ {selectedPlatform.credentials        │ │  │ │   │  │
│  │   │  │  │ │  .optional?.map((field) => (         │ │  │ │   │  │
│  │   │  │  │ │   <Input ... optional ...            │ │  │ │   │  │
│  │   │  │  │ │ ))}                                 │ │  │ │   │  │
│  │   │  │  │ └─────────────────────────────────────┘ │  │ │   │  │
│  │   │  │  │                                           │  │ │   │  │
│  │   │  │  │ [Checkbox: Activate Immediately]        │  │ │   │  │
│  │   │  │  │   checked={configureFormData.isActive}   │  │ │   │  │
│  │   │  │  │                                           │  │ │   │  │
│  │   │  │  └─────────────────────────────────────────┘  │ │   │  │
│  │   │  │                                               │ │   │  │
│  │   │  │  ──────────────────────────────────────────  │ │   │  │
│  │   │  │  [Cancel Button]  [Confirm/Update Button]   │ │   │  │
│  │   │  └──────────────────────────────────────────────┘ │   │  │
│  │   └────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │   )}                                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
USER INTERACTION
    │
    ├─────────────────────────────────────────────────────────────┐
    │                                                             │
    v                                                             v
[Click "Add Discord"]                                  [Click "Edit Platform"]
    │                                                             │
    v                                                             v
handleConfigurePlatform(selectedPlatformTemplate)  handleEditPlatform(existingPlatform)
    │                                                             │
    ├─ setSelectedPlatform(platformTemplate)           ├─ setSelectedPlatform(getPlatformInfo(...))
    ├─ setEditingPlatform(null)                        ├─ setEditingPlatform(platform)
    ├─ initializeFormData with empty credentials      ├─ initializeFormData with platform data
    ├─ setCustomIdManuallyEdited(false)               ├─ setCustomIdManuallyEdited(false)
    └─ setShowConfigureModal(true)                    └─ setShowConfigureModal(true)
    │                                                             │
    v                                                             v
  CREATE MODE                                               EDIT MODE
    │                                                             │
    ├─ Show "Platform ID" input with auto-generation ├─ Hide "Platform ID" field
    ├─ All credentials required                       ├─ All credentials optional
    ├─ Focus on collecting all required data         ├─ Allow partial updates
    └─ Help text: "Enter X" or show examples         └─ Help text: "Leave empty to keep current"
    │                                                             │
    └─────────────────────────────┬─────────────────────────────┘
                                  v
                          USER FILLS IN FORM
                                  │
    ┌─────────────────────────────┴─────────────────────────────┐
    │                                                           │
    v                                                           v
[Click Confirm]                                        [Click Update]
    │                                                           │
    v                                                           v
submitPlatformConfiguration()                    submitPlatformConfiguration()
    │                                                           │
    ├─ Validate name not empty                       ├─ Validate name not empty
    ├─ Validate custom ID (if editing: skip)        ├─ Skip ID validation
    ├─ Validate all required credentials            ├─ Only validate filled credentials
    └─ Validation passed? Continue                  └─ Validation passed? Continue
    │                                                           │
    v                                                           v
configurePlatform.mutateAsync({                  updatePlatform.mutateAsync({
  platform: 'discord',                             platformId: editingPlatform.id,
  id: autoGenerated,                               name: newName,
  name: userEnteredName,                           description: newDescription,
  description: userEnteredDesc,                    isActive: newIsActive,
  credentials: allCredentials,                     credentials: onlyNonEmptyCredentials
  isActive: true
})                                               })
    │                                                           │
    v                                                           v
POST /api/v1/projects/:id/platforms          PATCH /api/v1/projects/:id/platforms/:platformId
    │                                                           │
    v                                                           v
API Returns success                                   API Returns success
    │                                                           │
    └─────────────────────┬────────────────────────────────────┘
                          v
                  Query Invalidation
                  (queryClient.invalidateQueries)
                          │
                          v
                  usePlatforms() refetches
                          │
                          v
              Connected Platforms Card Updates
                          │
                          v
         Modal closes & state resets
                          │
                          v
            User sees updated platform list
```

## State Management Tree

```
Platforms Component
│
├── showConfigureModal: boolean
│   └── Controls modal visibility
│       └── Initial: false
│       └── Set to true by: handleConfigurePlatform(), handleEditPlatform()
│       └── Set to false by: submitPlatformConfiguration() or Cancel button
│
├── selectedPlatform: PlatformTemplate | null
│   └── The platform template being configured/edited
│   └── Contains: name, displayName, credentials (required/optional), features
│   └── Used for: rendering form fields, validation, API submission
│
├── editingPlatform: Platform | null
│   └── The existing platform being edited (null when creating)
│   └── Contains: id, name, platform, description, isActive, createdAt
│   └── Used for: determining edit vs create mode
│   └── Controls: ID field visibility, credential requirement level
│
├── configureFormData: FormData
│   ├── id: string
│   │   └── Platform ID (auto-generated or user-entered)
│   │   └── Only used in CREATE mode
│   │   └── Only shown if !editingPlatform
│   │
│   ├── name: string
│   │   └── Configuration name/title
│   │   └── Used in: modal title, API submission
│   │   └── Validation: required (non-empty)
│   │
│   ├── description: string
│   │   └── Optional description/notes
│   │   └── User-entered text area
│   │
│   ├── credentials: { [key: string]: string }
│   │   └── Dynamic object based on selectedPlatform.credentials
│   │   └── Keys are credential field names from backend
│   │   └── Values are user-entered values
│   │   └── Validation:
│   │       ├── CREATE mode: All required fields must be non-empty
│   │       └── EDIT mode: Only non-empty fields sent to API
│   │
│   └── isActive: boolean
│       └── Whether to activate platform immediately
│       └── Default: true on create, preserves on edit
│
├── customIdManuallyEdited: boolean
│   └── Tracks if user manually edited the platform ID field
│   └── Used for: controlling auto-generation (don't overwrite manual edits)
│
└── idValidationError: string | null
    └── Validation error message for platform ID
    └── Triggers when: ID doesn't meet format requirements
    └── Displayed in: Input component error prop
    └── Resets on: Modal close or handleConfigurePlatform() called
```

## Data Flow Diagram (Create Platform)

```
┌────────────────────────────────────────────────────────────────────────┐
│                    Create New Platform Flow                            │
└────────────────────────────────────────────────────────────────────────┘

STEP 1: Load Available Platforms
┌─────────────────────────────────────┐
│ useSupportedPlatforms()             │
│ ├─ Fetches: /platforms/supported    │
│ └─ Returns: Array<PlatformTemplate> │
│    ├─ discord                       │
│    │  ├─ displayName: "Discord"     │
│    │  ├─ credentials: {             │
│    │  │  required: ["botToken"]     │
│    │  │  optional: ["webhookUrl"]   │
│    │  └─ features: { ... }          │
│    └─ telegram, whatsapp-evo, etc   │
└─────────────────────────────────────┘
    │
    v
STEP 2: Display Available Platforms Grid
┌─────────────────────────────────────┐
│ User sees 3-column grid of platforms│
│ Each card has [Add Discord] button  │
└─────────────────────────────────────┘
    │
    v
STEP 3: User Clicks "Add Discord"
┌─────────────────────────────────────────────────────┐
│ handleConfigurePlatform(discordTemplate)            │
│ ├─ setSelectedPlatform(discordTemplate)             │
│ ├─ setEditingPlatform(null)  ← CREATE MODE         │
│ ├─ Initialize credentials: { botToken: '', ... }   │
│ └─ setShowConfigureModal(true)                      │
└─────────────────────────────────────────────────────┘
    │
    v
STEP 4: Modal Opens - User Fills Form
┌─────────────────────────────────────────────────────┐
│ Modal Shows:                                        │
│ ├─ [Input] Configuration Name                      │
│ │  User types: "My Discord Bot"                    │
│ │  onChange triggers useEffect for ID generation   │
│ ├─ [Input] Platform ID (auto-generated)            │
│ │  generateSlug("My Discord Bot") → "my-discord"   │
│ │  Shows validation: "✓ Valid"                     │
│ ├─ [Textarea] Description (optional)               │
│ ├─ [Input] Bot Token (required)                    │
│ │  User pastes token                               │
│ ├─ [Input] Webhook URL (optional)                  │
│ └─ [Checkbox] Activate Platform                    │
│    (checked by default)                            │
└─────────────────────────────────────────────────────┘
    │
    v
STEP 5: User Clicks [Confirm]
┌──────────────────────────────────────────────────┐
│ submitPlatformConfiguration()                    │
│ ├─ !editingPlatform? → true (CREATE mode)      │
│ ├─ Validate:                                    │
│ │  ├─ name "My Discord Bot" ✓                   │
│ │  ├─ id validation "my-discord" ✓              │
│ │  └─ required botToken filled ✓                │
│ └─ All valid → Proceed                          │
└──────────────────────────────────────────────────┘
    │
    v
STEP 6: API Call (Create Platform)
┌───────────────────────────────────────────────────────────┐
│ configurePlatform.mutateAsync({                          │
│   platform: 'discord',                                   │
│   id: 'my-discord',                                      │
│   name: 'My Discord Bot',                                │
│   description: '',                                       │
│   credentials: {                                         │
│     botToken: 'token123...'                              │
│     // webhookUrl omitted (empty in create mode)         │
│   },                                                     │
│   isActive: true,                                        │
│   project: projectId                                     │
│ })                                                       │
│                                                          │
│ POST /api/v1/projects/abc123/platforms                  │
│ Body: { platform, id, name, description, ... }          │
│ Response: { id, platform, name, ... }                   │
└───────────────────────────────────────────────────────────┘
    │
    v
STEP 7: Query Invalidation & Refetch
┌────────────────────────────────────────────────────┐
│ onSuccess callback in useConfigurePlatform hook    │
│ ├─ queryClient.invalidateQueries({                 │
│ │   queryKey: ['platforms', projectId]             │
│ │ })                                               │
│ └─ usePlatforms(projectId) refetches               │
│    GET /api/v1/projects/abc123/platforms           │
│    Returns: [                                      │
│    │ {                                             │
│    │   id: 'my-discord',                           │
│    │   platform: 'discord',                        │
│    │   name: 'My Discord Bot',                     │
│    │   isActive: true,                             │
│    │   credentials: { /* redacted */ }             │
│    │ },                                            │
│    │ ... other platforms                           │
│    │ ]                                             │
└────────────────────────────────────────────────────┘
    │
    v
STEP 8: Modal Closes & State Resets
┌─────────────────────────────────────────────────────┐
│ setShowConfigureModal(false)                        │
│ setSelectedPlatform(null)                           │
│ setEditingPlatform(null)                            │
│ setConfigureFormData({                              │
│   id: '', name: '', description: '', ... reset ...  │
│ })                                                 │
└─────────────────────────────────────────────────────┘
    │
    v
STEP 9: User Sees Updated List
┌───────────────────────────────────────────────┐
│ Connected Platforms Card now shows:           │
│ ┌─────────────────────────────────────────┐  │
│ │ 🔵 My Discord Bot [Active]              │  │
│ │ ID: my-discord (with copy button)       │  │
│ │ Type: Discord                           │  │
│ │ Created on: 2024-11-05                  │  │
│ │ [Configure] [Delete]                    │  │
│ └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

## Field Type Detection Matrix

```
Field Name Pattern          → Input Type
─────────────────────────────────────────────
"password", "pwd"           → type="password"
"token", "authToken"        → type="password"
"key", "apiKey", "secret"   → type="password"
"url", "endpoint"           → type="url"
"email", "emailAddress"     → type="email"
"number", "count", "port"   → type="number"
DEFAULT                     → type="text"
```

## Error Handling Flow

```
USER INTERACTION
    │
    v
submitPlatformConfiguration()
    │
    ├─ Required field missing?
    │  └─ YES: toast.error("Please fill field X")
    │         User sees toast notification
    │         Form stays open
    │
    ├─ ID validation error (create mode)?
    │  └─ YES: toast.error(idValidationError)
    │         User sees toast notification
    │         Form stays open
    │
    ├─ API call fails?
    │  └─ YES: catch(error)
    │         console.error(error)
    │         User sees toast error (implicit)
    │         Form stays open
    │
    └─ All validation passed?
       └─ YES: mutateAsync(formData)
              → Promise resolves
              → onSuccess callback
              → Modal closes
              → State resets
```

