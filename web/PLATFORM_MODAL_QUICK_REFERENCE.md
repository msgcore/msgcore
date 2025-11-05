# Platform Configuration Modal - Quick Reference

## Key File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `/root/msgcore/web/src/pages/Platforms.tsx` | Main page with modal implementation | 512-667 |
| `/root/msgcore/web/src/hooks/usePlatforms.ts` | API hooks for platforms | All |
| `/root/msgcore/web/src/components/ui/Input.tsx` | Input component used in form | All |
| `/root/msgcore/web/src/components/ui/Button.tsx` | Button component used in modal | All |
| `/root/msgcore/web/src/components/ui/Modal.tsx` | Reusable Modal (NOT used by platform modal) | All |
| `/root/msgcore/web/src/locales/en/platforms.json` | English translations | All |

## Quick Code Snippets

### 1. Opening the Modal (Create Mode)

```typescript
const handleConfigurePlatform = (platform: any) => {
  setSelectedPlatform(platform);
  setEditingPlatform(null);  // Key: null = CREATE mode
  
  const initialCredentials: any = {};
  platform.credentials?.required?.forEach((field: string) => {
    initialCredentials[field] = '';
  });
  
  setConfigureFormData({
    id: '',
    name: '',
    description: '',
    credentials: initialCredentials,
    isActive: true
  });
  setShowConfigureModal(true);
};
```

### 2. Opening the Modal (Edit Mode)

```typescript
const handleEditPlatform = (platform: any) => {
  const platformInfo = getPlatformInfo(platform.platform);
  setSelectedPlatform(platformInfo);
  setEditingPlatform(platform);  // Key: not null = EDIT mode
  
  const initialCredentials: any = {};
  platformInfo?.credentials?.required?.forEach((field: string) => {
    initialCredentials[field] = '';  // Redacted from API, must re-enter
  });
  
  setConfigureFormData({
    id: '',  // Hidden in edit mode
    name: platform.name || '',
    description: platform.description || '',
    credentials: initialCredentials,
    isActive: platform.isActive || false
  });
  setShowConfigureModal(true);
};
```

### 3. Modal Rendering

```typescript
{showConfigureModal && selectedPlatform && (
  <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingPlatform 
          ? `Edit ${configureFormData.name}` 
          : `Configure ${selectedPlatform.displayName}`}
      </h3>
      {/* Form fields here */}
    </div>
  </div>
)}
```

### 4. Dynamic Credential Fields

```typescript
{selectedPlatform.credentials && (
  <>
    {/* Required fields */}
    {selectedPlatform.credentials.required?.map((field: string) => (
      <Input
        key={field}
        label={`${formatFieldName(field)}${editingPlatform ? ` (leave empty to keep current)` : ''}`}
        type={getFieldType(field)}  // password, url, email, number, or text
        value={configureFormData.credentials[field] || ''}
        onChange={(e) => setConfigureFormData({
          ...configureFormData,
          credentials: { ...configureFormData.credentials, [field]: e.target.value }
        })}
        required={!editingPlatform}
      />
    ))}
    
    {/* Optional fields */}
    {selectedPlatform.credentials.optional?.map((field: string) => (
      <Input
        key={field}
        label={`${formatFieldName(field)} (optional)`}
        type={getFieldType(field)}
        value={configureFormData.credentials[field] || ''}
        onChange={(e) => setConfigureFormData({
          ...configureFormData,
          credentials: { ...configureFormData.credentials, [field]: e.target.value }
        })}
      />
    ))}
  </>
)}
```

### 5. Form Submission (Create)

```typescript
if (editingPlatform) {
  // Update flow
} else {
  // Create flow
  if (!selectedPlatform) return;
  
  // Validate ID
  if (idValidationError) {
    toast.error(idValidationError);
    return;
  }
  
  // Validate required fields
  const requiredFields = selectedPlatform.credentials?.required || [];
  for (const field of requiredFields) {
    if (!configureFormData.credentials[field]) {
      toast.error(`Please fill in the required field: ${field}`);
      return;
    }
  }
  
  // Create platform
  await configurePlatform.mutateAsync({
    platform: selectedPlatform.name,
    id: configureFormData.id || undefined,
    name: configureFormData.name,
    description: configureFormData.description,
    credentials: configureFormData.credentials,
    isActive: configureFormData.isActive
  });
}
```

### 6. Form Submission (Update)

```typescript
if (editingPlatform) {
  const updateData: any = {
    platformId: editingPlatform.id,
    name: configureFormData.name,
    description: configureFormData.description,
    isActive: configureFormData.isActive
  };
  
  // Only send non-empty credentials (since existing ones are redacted)
  const nonEmptyCredentials: any = {};
  Object.keys(configureFormData.credentials).forEach(key => {
    if (configureFormData.credentials[key]) {
      nonEmptyCredentials[key] = configureFormData.credentials[key];
    }
  });
  
  if (Object.keys(nonEmptyCredentials).length > 0) {
    updateData.credentials = nonEmptyCredentials;
  }
  
  await updatePlatform.mutateAsync(updateData);
}
```

### 7. ID Auto-Generation & Validation

```typescript
useEffect(() => {
  if (!editingPlatform && !customIdManuallyEdited && configureFormData.name) {
    const generatedId = generateSlug(configureFormData.name);
    setConfigureFormData((prev: any) => ({ ...prev, id: generatedId }));
    
    const error = getSlugValidationError(generatedId);
    setIdValidationError(error);
  }
}, [configureFormData.name, editingPlatform, customIdManuallyEdited]);
```

### 8. Field Type Detection

```typescript
const getFieldType = (field: string): string => {
  const lowerField = field.toLowerCase();
  
  if (lowerField.includes('password') || lowerField.includes('token') || 
      lowerField.includes('key') || lowerField.includes('secret')) {
    return 'password';
  }
  if (lowerField.includes('url') || lowerField.includes('endpoint')) {
    return 'url';
  }
  if (lowerField.includes('email')) {
    return 'email';
  }
  if (lowerField.includes('number') || lowerField.includes('port')) {
    return 'number';
  }
  return 'text';
};
```

### 9. Field Name Formatting

```typescript
const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Api/g, 'API')
    .replace(/Url/g, 'URL')
    .replace(/Id/g, 'ID');
};
// Examples:
// "botToken" → "Bot Token"
// "evolutionApiKey" → "Evolution API Key"
// "webhookUrl" → "Webhook URL"
```

### 10. API Hooks

```typescript
// Create platform
const configurePlatform = useConfigurePlatform(selectedProjectId);

// Update platform
const updatePlatform = useUpdatePlatform(selectedProjectId);

// Delete platform
const deletePlatform = useDeletePlatform(selectedProjectId);

// List platforms
const { data: platforms = [] } = usePlatforms(selectedProjectId);

// Get supported platforms
const { data: supportedPlatformsData } = useSupportedPlatforms();
```

## Modal State Variables

```typescript
// Visibility
const [showConfigureModal, setShowConfigureModal] = useState(false);

// Platform template (from supported platforms)
const [selectedPlatform, setSelectedPlatform] = useState<any>(null);

// Existing platform being edited (null = create mode)
const [editingPlatform, setEditingPlatform] = useState<any>(null);

// Form data
const [configureFormData, setConfigureFormData] = useState<any>({
  id: '',
  name: '',
  description: '',
  credentials: {},
  isActive: true
});

// ID validation
const [customIdManuallyEdited, setCustomIdManuallyEdited] = useState(false);
const [idValidationError, setIdValidationError] = useState<string | null>(null);
```

## Supported Platforms

From the code, these platforms are supported:
- `discord` - Discord bots
- `telegram` - Telegram bots
- `whatsapp-evo` - WhatsApp via Evolution API
- `slack` - Slack apps
- `email` - Email messaging
- `sms` - SMS messaging

Each platform template includes:
- `name` - Unique identifier (e.g., 'discord')
- `displayName` - User-friendly name (e.g., 'Discord')
- `credentials.required` - Array of required credential field names
- `credentials.optional` - Array of optional credential field names
- `credentials.example` - Object with example values for each field
- `features` - Object with feature support (webhooks, websocket, polling)

## Create vs Edit Mode

| Feature | Create Mode | Edit Mode |
|---------|------------|-----------|
| ID Field | Shown, auto-generated | Hidden (immutable) |
| Credentials | All required | All optional |
| Name | Required | Required |
| Description | Optional | Optional |
| Activation | Checkbox enabled | Checkbox enabled |
| API Call | POST /platforms | PATCH /platforms/:id |
| Validation Level | Strict | Lenient |
| Redacted Credentials | N/A | User must re-enter to change |

## Platform Icon Mapping

```typescript
case 'discord' → FaDiscord (indigo)
case 'telegram' → FaTelegram (blue)
case 'whatsapp' or 'whatsapp-evo' → FaWhatsapp (green)
case 'slack' → FaSlack (purple)
case 'email' → FaEnvelope (gray)
case 'sms' → FaSms (pink)
```

## Error Handling Strategy

1. **Toast Notifications** - For validation errors
2. **Input Error Props** - For field-level errors (ID validation)
3. **Console Logging** - For API errors

## i18n Translation Keys

```json
{
  "configurationModal.titleEdit": "Edit",
  "configurationModal.titleConfigure": "Configure",
  "configurationModal.nameLabel": "Configuration Name",
  "configurationModal.descriptionLabel": "Description (optional)",
  "configurationModal.leaveEmptyHint": "(leave empty to keep current)",
  "configurationModal.activateImmediately": "Activate platform immediately",
  "configurationModal.configure": "Configure",
  "configurationModal.update": "Update",
  "configurationModal.cancel": "Cancel"
}
```

## Common Issues & Solutions

### Issue: Form stays open after submission
**Solution**: Check if validation is passing and API is responding successfully

### Issue: ID field not showing in edit mode
**Solution**: This is intentional - IDs are immutable, so they're hidden during edit

### Issue: User can't change credentials
**Solution**: In edit mode, API redacts credentials, so user must re-enter to change them

### Issue: Auto-generated ID has invalid characters
**Solution**: Use `generateSlug()` utility which validates format automatically

## Testing Approach

For testing the platform modal:

1. **Mock `usePlatforms` hook** - Return test platforms
2. **Mock `useSupportedPlatforms` hook** - Return platform templates
3. **Mock `configurePlatform` mutation** - Return success/error
4. **Mock `updatePlatform` mutation** - Return success/error
5. **Test create flow** - From clicking Add to form submission
6. **Test edit flow** - From clicking Edit to form submission
7. **Test validation** - Required fields, ID validation
8. **Test modal open/close** - State management

## Migration Opportunities

The modal could benefit from:
1. Extraction to `/components/platforms/PlatformConfigModal.tsx`
2. Custom hook `usePlatformConfigForm.ts` for form logic
3. Using the reusable `Modal` component from `/components/ui/Modal.tsx`
4. Refactoring large `Platforms.tsx` file (671 lines)
5. Better error display in-modal instead of just toast

