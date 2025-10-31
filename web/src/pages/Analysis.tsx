import { useState } from 'react';
import {
  Plus,
  Trash2,
  Brain,
  Loader2,
  AlertCircle,
  Edit2,
  Sparkles,
  Code,
  Zap,
  FileText,
  Play,
  Database,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import {
  useEntitySchemas,
  useCreateEntitySchema,
  useUpdateEntitySchema,
  useDeleteEntitySchema,
  CreateEntitySchemaDto,
  useAnalysisProfiles,
  useCreateAnalysisProfile,
  useUpdateAnalysisProfile,
  useDeleteAnalysisProfile,
  CreateAnalysisProfileDto,
  useAnalysisRuns,
  useCreateAnalysisRun,
  useCancelAnalysisRun,
  useAnalysisRun,
  CreateAnalysisRunDto,
  useExtractedEntities,
  useAnalysisStats,
  useModels,
} from '../hooks/useAnalysis';
import { useProjectContext } from '../contexts/ProjectContext';
import { useConfirm } from '../hooks/useConfirm';
import { formatDateTime } from '../lib/utils';

type Tab = 'schemas' | 'profiles' | 'runs' | 'entities' | 'stats';

export function Analysis() {
  const { selectedProjectId } = useProjectContext();

  // Schemas
  const { data: schemas = [], isLoading, error } = useEntitySchemas(selectedProjectId || undefined);
  const createSchema = useCreateEntitySchema(selectedProjectId || undefined);
  const updateSchema = useUpdateEntitySchema(selectedProjectId || undefined);
  const deleteSchema = useDeleteEntitySchema(selectedProjectId || undefined);
  const { data: models = [], isLoading: modelsLoading } = useModels();

  // Profiles
  const { data: profiles = [], isLoading: profilesLoading, error: profilesError } = useAnalysisProfiles(selectedProjectId || undefined);
  const createProfile = useCreateAnalysisProfile(selectedProjectId || undefined);
  const updateProfile = useUpdateAnalysisProfile(selectedProjectId || undefined);
  const deleteProfile = useDeleteAnalysisProfile(selectedProjectId || undefined);

  // Runs
  const [runsSortBy, setRunsSortBy] = useState<string>('createdAt');
  const [runsSortOrder, setRunsSortOrder] = useState<'asc' | 'desc'>('desc');
  const { data: runs = [], isLoading: runsLoading, error: runsError } = useAnalysisRuns(
    selectedProjectId || undefined,
    runsSortBy,
    runsSortOrder
  );
  const createRun = useCreateAnalysisRun(selectedProjectId || undefined);
  const cancelRun = useCancelAnalysisRun(selectedProjectId || undefined);

  // Entities
  const [entityFilters, setEntityFilters] = useState<{
    runId?: string;
    schemaId?: string;
    chatId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>({ limit: 20, offset: 0, sortBy: 'extractedAt', sortOrder: 'desc' });
  const { data: entities = [], isLoading: entitiesLoading, error: entitiesError } = useExtractedEntities(
    selectedProjectId || undefined,
    entityFilters
  );

  // Stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useAnalysisStats(selectedProjectId || undefined);

  const { confirm, ConfirmDialog } = useConfirm();

  const [activeTab, setActiveTab] = useState<Tab>('schemas');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchemaId, setEditingSchemaId] = useState<string | null>(null);
  const [deletingSchemaId, setDeletingSchemaId] = useState<string | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [showCreateProfileForm, setShowCreateProfileForm] = useState(false);
  const [showCreateRunForm, setShowCreateRunForm] = useState(false);

  const [newSchema, setNewSchema] = useState<CreateEntitySchemaDto>({
    name: '',
    description: '',
    properties: {},
    prompt: '',
    model: 'anthropic/claude-3.5-sonnet',
    temperature: 0.1,
  });

  const [propertiesJson, setPropertiesJson] = useState('{\n  "score": "number",\n  "label": "string"\n}');

  const [newProfile, setNewProfile] = useState<CreateAnalysisProfileDto>({
    name: '',
    description: '',
    graphDefinition: {},
    entitySchemaIds: [],
    storeEntities: true,
    generateTags: false,
  });

  const [newRun, setNewRun] = useState<CreateAnalysisRunDto>({
    profileId: '',
    chatIds: [],
    identityIds: [],
    dateRangeStart: '',
    dateRangeEnd: '',
  });

  const handleCreateSchema = async () => {
    if (!newSchema.name.trim()) return;

    try {
      const properties = JSON.parse(propertiesJson);

      if (editingSchemaId) {
        // Update existing schema
        await updateSchema.mutateAsync({
          schemaId: editingSchemaId,
          ...newSchema,
          properties,
        });
        setEditingSchemaId(null);
      } else {
        // Create new schema
        await createSchema.mutateAsync({
          ...newSchema,
          properties,
        });
        setShowCreateForm(false);
      }

      // Reset form
      setNewSchema({
        name: '',
        description: '',
        extractionType: 'llm_extraction',
        properties: {},
        prompt: '',
        model: 'anthropic/claude-3.5-sonnet',
        temperature: 0.1,
      });
      setPropertiesJson('{\n  "score": "number",\n  "label": "string"\n}');
    } catch (error) {
      console.error('Failed to save entity schema:', error);
    }
  };

  const handleDeleteSchema = async (schemaId: string, schemaName: string) => {
    const confirmed = await confirm({
      title: 'Delete Entity Schema',
      message: `Are you sure you want to delete "${schemaName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    setDeletingSchemaId(schemaId);
    try {
      await deleteSchema.mutateAsync(schemaId);
    } catch (error) {
      console.error('Failed to delete entity schema:', error);
    } finally {
      setDeletingSchemaId(null);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfile.name.trim() || newProfile.entitySchemaIds.length === 0) return;

    try {
      if (editingProfileId) {
        // Update existing profile
        await updateProfile.mutateAsync({
          profileId: editingProfileId,
          ...newProfile,
        });
        setEditingProfileId(null);
      } else {
        // Create new profile
        await createProfile.mutateAsync(newProfile);
        setShowCreateProfileForm(false);
      }

      // Reset form
      setNewProfile({
        name: '',
        description: '',
        graphDefinition: {},
        entitySchemaIds: [],
        storeEntities: true,
        generateTags: false,
      });
    } catch (error) {
      console.error('Failed to save analysis profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    const confirmed = await confirm({
      title: 'Delete Analysis Profile',
      message: `Are you sure you want to delete "${profileName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    setDeletingProfileId(profileId);
    try {
      await deleteProfile.mutateAsync(profileId);
    } catch (error) {
      console.error('Failed to delete analysis profile:', error);
    } finally {
      setDeletingProfileId(null);
    }
  };

  const handleCreateRun = async () => {
    if (!newRun.profileId) return;

    // Validate that at least one target is specified
    const hasTargets =
      (newRun.chatIds && newRun.chatIds.length > 0) ||
      (newRun.identityIds && newRun.identityIds.length > 0) ||
      (newRun.dateRangeStart && newRun.dateRangeEnd);

    if (!hasTargets) {
      alert('Please specify at least one target: chats, identities, or date range');
      return;
    }

    try {
      const runData: CreateAnalysisRunDto = {
        profileId: newRun.profileId,
        chatIds: newRun.chatIds && newRun.chatIds.length > 0 ? newRun.chatIds : undefined,
        identityIds: newRun.identityIds && newRun.identityIds.length > 0 ? newRun.identityIds : undefined,
        dateRangeStart: newRun.dateRangeStart || undefined,
        dateRangeEnd: newRun.dateRangeEnd || undefined,
      };

      await createRun.mutateAsync(runData);
      setNewRun({
        profileId: '',
        chatIds: [],
        identityIds: [],
        dateRangeStart: '',
        dateRangeEnd: '',
      });
      setShowCreateRunForm(false);
    } catch (error) {
      console.error('Failed to create analysis run:', error);
    }
  };

  const toggleSchemaSelection = (schemaId: string) => {
    setNewProfile((prev) => ({
      ...prev,
      entitySchemaIds: prev.entitySchemaIds.includes(schemaId)
        ? prev.entitySchemaIds.filter((id) => id !== schemaId)
        : [...prev.entitySchemaIds, schemaId],
    }));
  };

  const getExtractionTypeIcon = (type: string) => {
    switch (type) {
      case 'llm_extraction':
        return <Brain className="w-4 h-4" />;
      case 'rule_based':
        return <Code className="w-4 h-4" />;
      case 'api_logged':
        return <Zap className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getExtractionTypeColor = (type: string) => {
    switch (type) {
      case 'llm_extraction':
        return 'blue';
      case 'rule_based':
        return 'green';
      case 'api_logged':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis & Extraction</h1>
          <p className="text-gray-600 mt-1">
            Generic, reusable analysis pipelines with LangGraph
          </p>
        </div>
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <span>Please select a project first</span>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="p-4 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              Analysis & Extraction
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Generic, reusable analysis pipelines with LangGraph
            </p>
          </div>
          {activeTab === 'schemas' && (
            <Button
              onClick={() => {
                setEditingSchemaId(null);
                setShowCreateForm(true);
              }}
              disabled={showCreateForm || editingSchemaId !== null}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schema
            </Button>
          )}
          {activeTab === 'profiles' && (
            <Button
              onClick={() => {
                setEditingProfileId(null);
                setShowCreateProfileForm(true);
              }}
              disabled={showCreateProfileForm || editingProfileId !== null || schemas.length === 0}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          )}
          {activeTab === 'runs' && (
            <Button
              onClick={() => setShowCreateRunForm(true)}
              disabled={showCreateRunForm || profiles.length === 0}
              variant="primary"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Run
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('schemas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schemas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Entity Schemas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profiles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Analysis Profiles
              </div>
            </button>
            <button
              onClick={() => setActiveTab('runs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'runs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Analysis Runs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('entities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Extracted Entities
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistics
              </div>
            </button>
          </nav>
        </div>

        {/* Schemas Tab */}
        {activeTab === 'schemas' && (
          <>
            {/* Create/Edit Form */}
            {(showCreateForm || editingSchemaId) && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">
                {editingSchemaId ? 'Edit Entity Schema' : 'Create Entity Schema'}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schema Name *
                  </label>
                  <Input
                    type="text"
                    value={newSchema.name}
                    onChange={(e) => setNewSchema({ ...newSchema, name: e.target.value })}
                    placeholder="e.g., Sentiment, BuyingIntent, ContactInfo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    type="text"
                    value={newSchema.description}
                    onChange={(e) => setNewSchema({ ...newSchema, description: e.target.value })}
                    placeholder="What does this schema extract?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <select
                    value={newSchema.model}
                    onChange={(e) => setNewSchema({ ...newSchema, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={modelsLoading}
                  >
                    {modelsLoading ? (
                      <option>Loading models...</option>
                    ) : models.length > 0 ? (
                      models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))
                    ) : (
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Fallback)</option>
                    )}
                  </select>
                  {!modelsLoading && models.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {models.find(m => m.id === newSchema.model)?.description || 'Select a model for extraction'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt *
                  </label>
                  <textarea
                    value={newSchema.prompt}
                    onChange={(e) => setNewSchema({ ...newSchema, prompt: e.target.value })}
                    placeholder="e.g., Analyze the sentiment of this message and return a score from -1 to 1"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature ({newSchema.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newSchema.temperature}
                    onChange={(e) => setNewSchema({ ...newSchema, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Precise (0)</span>
                    <span>Creative (1)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Properties (JSON) *
                  </label>
                  <textarea
                    value={propertiesJson}
                    onChange={(e) => setPropertiesJson(e.target.value)}
                    placeholder='{"score": "number", "label": "string"}'
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Define the properties to extract as JSON
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateSchema}
                    disabled={createSchema.isPending || updateSchema.isPending || !newSchema.name.trim()}
                    variant="primary"
                  >
                    {(createSchema.isPending || updateSchema.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingSchemaId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingSchemaId ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {editingSchemaId ? 'Update Schema' : 'Create Schema'}
                      </>
                    )}
                  </Button>
                  <Button onClick={() => {
                    setShowCreateForm(false);
                    setEditingSchemaId(null);
                    setNewSchema({
                      name: '',
                      description: '',
                      extractionType: 'llm_extraction',
                      properties: {},
                      prompt: '',
                      model: 'anthropic/claude-3.5-sonnet',
                      temperature: 0.1,
                    });
                    setPropertiesJson('{\n  "score": "number",\n  "label": "string"\n}');
                  }} variant="secondary">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load entity schemas. Please try again.</span>
          </Alert>
        )}

        {/* Schemas List */}
        {!isLoading && !error && schemas.length === 0 && !showCreateForm && (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No entity schemas yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first entity schema to start extracting insights from messages
              </p>
              <Button onClick={() => {
                setEditingSchemaId(null);
                setShowCreateForm(true);
              }} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Schema
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && schemas.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schemas.map((schema: any) => (
              <Card key={schema.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{schema.name}</h3>
                      {schema.description && (
                        <p className="text-sm text-gray-500 mt-1">{schema.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingSchemaId(schema.id);
                          setNewSchema({
                            name: schema.name,
                            description: schema.description || '',
                            extractionType: schema.extractionType,
                            properties: schema.properties,
                            prompt: schema.prompt || '',
                            model: schema.model || 'anthropic/claude-3.5-sonnet',
                            temperature: schema.temperature || 0.1,
                            ruleDefinition: schema.ruleDefinition,
                          });
                          setPropertiesJson(JSON.stringify(schema.properties, null, 2));
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteSchema(schema.id, schema.name)}
                        disabled={deletingSchemaId === schema.id}
                        variant="secondary"
                        size="sm"
                      >
                        {deletingSchemaId === schema.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={getExtractionTypeColor(schema.extractionType) as any}>
                        {getExtractionTypeIcon(schema.extractionType)}
                        <span className="ml-1">
                          {schema.extractionType.replace('_', ' ')}
                        </span>
                      </Badge>
                      {schema.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    {schema.extractionType === 'llm_extraction' && schema.model && (
                      <div className="text-xs text-gray-500">
                        <strong>Model:</strong> {schema.model}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      <strong>Properties:</strong> {Object.keys(schema.properties).join(', ')}
                    </div>

                    <div className="text-xs text-gray-400 pt-2 border-t">
                      Created {formatDateTime(schema.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </>
        )}

        {/* Profiles Tab */}
        {activeTab === 'profiles' && (
          <>
            {/* Create/Edit Profile Form */}
            {(showCreateProfileForm || editingProfileId) && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-lg font-semibold">
                    {editingProfileId ? 'Edit Analysis Profile' : 'Create Analysis Profile'}
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Name *
                      </label>
                      <Input
                        type="text"
                        value={newProfile.name}
                        onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                        placeholder="e.g., Customer Support Analysis, Sales Pipeline"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Input
                        type="text"
                        value={newProfile.description}
                        onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                        placeholder="What does this profile analyze?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entity Schemas * (select at least one)
                      </label>
                      {schemas.length === 0 ? (
                        <Alert variant="warning">
                          <AlertCircle className="h-4 w-4" />
                          <span>No schemas available. Create a schema first.</span>
                        </Alert>
                      ) : (
                        <div className="border rounded-lg divide-y">
                          {schemas.map((schema: any) => (
                            <label
                              key={schema.id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={newProfile.entitySchemaIds.includes(schema.id)}
                                onChange={() => toggleSchemaSelection(schema.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{schema.name}</div>
                                {schema.description && (
                                  <div className="text-sm text-gray-500">{schema.description}</div>
                                )}
                              </div>
                              <Badge variant={getExtractionTypeColor(schema.extractionType) as any}>
                                {schema.extractionType.replace('_', ' ')}
                              </Badge>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Options</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newProfile.storeEntities}
                            onChange={(e) => setNewProfile({ ...newProfile, storeEntities: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Store extracted entities</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateProfile}
                        disabled={createProfile.isPending || updateProfile.isPending || !newProfile.name.trim() || newProfile.entitySchemaIds.length === 0}
                        variant="primary"
                      >
                        {(createProfile.isPending || updateProfile.isPending) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {editingProfileId ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            {editingProfileId ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            {editingProfileId ? 'Update Profile' : 'Create Profile'}
                          </>
                        )}
                      </Button>
                      <Button onClick={() => {
                        setShowCreateProfileForm(false);
                        setEditingProfileId(null);
                        setNewProfile({
                          name: '',
                          description: '',
                          graphDefinition: {},
                          entitySchemaIds: [],
                          storeEntities: true,
                          generateTags: false,
                        });
                      }} variant="secondary">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {profilesLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Error State */}
            {profilesError && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to load analysis profiles. Please try again.</span>
              </Alert>
            )}

            {/* Empty State */}
            {!profilesLoading && !profilesError && profiles.length === 0 && !showCreateProfileForm && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis profiles yet</h3>
                  <p className="text-gray-500 mb-4">
                    Create a profile to combine multiple schemas into a versioned analysis pipeline
                  </p>
                  {schemas.length === 0 ? (
                    <Alert variant="info" className="max-w-md mx-auto">
                      <AlertCircle className="h-4 w-4" />
                      <span>Create entity schemas first, then create a profile</span>
                    </Alert>
                  ) : (
                    <Button onClick={() => {
                      setEditingProfileId(null);
                      setShowCreateProfileForm(true);
                    }} variant="primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profiles List */}
            {!profilesLoading && !profilesError && profiles.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile: any) => (
                  <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                          {profile.description && (
                            <p className="text-sm text-gray-500 mt-1">{profile.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setEditingProfileId(profile.id);
                              setNewProfile({
                                name: profile.name,
                                description: profile.description || '',
                                graphDefinition: profile.graphDefinition,
                                entitySchemaIds: profile.entitySchemaIds,
                                storeEntities: profile.storeEntities,
                                generateTags: profile.generateTags,
                              });
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteProfile(profile.id, profile.name)}
                            disabled={deletingProfileId === profile.id}
                            variant="secondary"
                            size="sm"
                          >
                            {deletingProfileId === profile.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Badge variant="purple">Version {profile.version}</Badge>
                          {profile.isActive ? (
                            <Badge variant="success" className="ml-2">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-2">Inactive</Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-600">
                          <strong>Schemas:</strong> {profile.entitySchemaIds.length} selected
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {profile.storeEntities && (
                            <Badge variant="purple" size="sm">Store entities</Badge>
                          )}
                        </div>

                        <div className="text-xs text-gray-400 pt-2 border-t">
                          Created {formatDateTime(profile.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Runs Tab */}
        {activeTab === 'runs' && (
          <>
            {/* Create Run Form */}
            {showCreateRunForm && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-lg font-semibold">Start Analysis Run</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Analysis Profile *
                      </label>
                      <select
                        value={newRun.profileId}
                        onChange={(e) => setNewRun({ ...newRun, profileId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a profile...</option>
                        {profiles.map((profile: any) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.name} (v{profile.version})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700">
                        Target Filters (specify at least one)
                      </p>

                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range (optional)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Start Date
                            </label>
                            <Input
                              type="date"
                              value={newRun.dateRangeStart}
                              onChange={(e) => setNewRun({ ...newRun, dateRangeStart: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              End Date
                            </label>
                            <Input
                              type="date"
                              value={newRun.dateRangeEnd}
                              onChange={(e) => setNewRun({ ...newRun, dateRangeEnd: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Chat IDs Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specific Chats (optional)
                        </label>
                        <Input
                          type="text"
                          value={newRun.chatIds?.join(', ') || ''}
                          onChange={(e) => setNewRun({
                            ...newRun,
                            chatIds: e.target.value ? e.target.value.split(',').map(id => id.trim()).filter(id => id) : []
                          })}
                          placeholder="e.g., chat-id-1, chat-id-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter chat IDs separated by commas (combine with date range to filter specific chats in a time period)
                        </p>
                      </div>

                      {/* Identity IDs Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specific Identities (optional)
                        </label>
                        <Input
                          type="text"
                          value={newRun.identityIds?.join(', ') || ''}
                          onChange={(e) => setNewRun({
                            ...newRun,
                            identityIds: e.target.value ? e.target.value.split(',').map(id => id.trim()).filter(id => id) : []
                          })}
                          placeholder="e.g., user-123, user-456"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter identity IDs separated by commas (for future use)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateRun}
                        disabled={createRun.isPending || !newRun.profileId}
                        variant="primary"
                      >
                        {createRun.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Run
                          </>
                        )}
                      </Button>
                      <Button onClick={() => setShowCreateRunForm(false)} variant="secondary">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {runsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Error State */}
            {runsError && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to load analysis runs. Please try again.</span>
              </Alert>
            )}

            {/* Empty State */}
            {!runsLoading && !runsError && runs.length === 0 && !showCreateRunForm && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis runs yet</h3>
                  <p className="text-gray-500 mb-4">
                    Execute an analysis profile over your message history to extract entities
                  </p>
                  {profiles.length === 0 ? (
                    <Alert variant="info" className="max-w-md mx-auto">
                      <AlertCircle className="h-4 w-4" />
                      <span>Create an analysis profile first, then run it</span>
                    </Alert>
                  ) : (
                    <Button onClick={() => setShowCreateRunForm(true)} variant="primary">
                      <Play className="w-4 h-4 mr-2" />
                      Start Run
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Runs List */}
            {!runsLoading && !runsError && runs.length > 0 && (
              <div className="space-y-4">
                {/* Sorting Controls */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Sort by:</span>
                      <select
                        value={runsSortBy}
                        onChange={(e) => setRunsSortBy(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="startedAt">Started Date</option>
                        <option value="completedAt">Completed Date</option>
                        <option value="status">Status</option>
                        <option value="progress">Progress</option>
                        <option value="entitiesExtracted">Entities Extracted</option>
                      </select>
                      <select
                        value={runsSortOrder}
                        onChange={(e) => setRunsSortOrder(e.target.value as 'asc' | 'desc')}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                      <span className="text-sm text-gray-500 ml-auto">
                        {runs.length} {runs.length === 1 ? 'run' : 'runs'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {runs.map((run: any) => (
                  <Card key={run.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Run #{run.id.substring(0, 8)}
                            </h3>
                            {run.status === 'pending' && (
                              <Badge variant="gray">
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                Pending
                              </Badge>
                            )}
                            {run.status === 'running' && (
                              <Badge variant="blue">
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                Running
                              </Badge>
                            )}
                            {run.status === 'completed' && (
                              <Badge variant="success">Completed</Badge>
                            )}
                            {run.status === 'failed' && (
                              <Badge variant="danger">Failed</Badge>
                            )}
                            {run.status === 'cancelled' && (
                              <Badge variant="secondary">Cancelled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Profile: {run.profileId} (v{run.profileVersion})
                          </p>
                        </div>
                        {(run.status === 'pending' || run.status === 'running') && (
                          <Button
                            onClick={async () => {
                              if (confirm('Cancel this analysis run?')) {
                                await cancelRun.mutateAsync(run.id);
                              }
                            }}
                            disabled={cancelRun.isPending}
                            variant="secondary"
                            size="sm"
                          >
                            {cancelRun.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Cancel'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="text-gray-500">Targets:</span>
                            <div className="ml-2 mt-1 flex flex-wrap gap-2">
                              {run.dateRangeStart && run.dateRangeEnd && (
                                <Badge variant="blue" size="sm">
                                  {new Date(run.dateRangeStart).toLocaleDateString()} - {new Date(run.dateRangeEnd).toLocaleDateString()}
                                </Badge>
                              )}
                              {run.chatIds && run.chatIds.length > 0 && (
                                <Badge variant="purple" size="sm">
                                  {run.chatIds.length} chat{run.chatIds.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                              {run.identityIds && run.identityIds.length > 0 && (
                                <Badge variant="green" size="sm">
                                  {run.identityIds.length} identit{run.identityIds.length > 1 ? 'ies' : 'y'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Progress:</span>
                            <span className="ml-2 font-medium">
                              {Math.round((run.progress || 0) * 100)}%
                            </span>
                          </div>
                        </div>

                        {run.status === 'running' && run.progress !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.round((run.progress || 0) * 100)}%` }}
                            />
                          </div>
                        )}

                        {run.status === 'completed' && (
                          <div className="grid grid-cols-3 gap-4 text-sm pt-2 border-t">
                            <div>
                              <div className="text-gray-500 text-xs">Entities</div>
                              <div className="font-semibold">{run.entitiesExtracted || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs">Tokens</div>
                              <div className="font-semibold">{run.tokensUsed?.toLocaleString() || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs">Cost</div>
                              <div className="font-semibold">
                                ${(run.estimatedCostUsd || 0).toFixed(4)}
                              </div>
                            </div>
                          </div>
                        )}

                        {run.status === 'failed' && run.errorMessage && (
                          <Alert variant="error">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{run.errorMessage}</span>
                          </Alert>
                        )}

                        <div className="text-xs text-gray-400 pt-2 border-t">
                          Started {formatDateTime(run.createdAt)}
                          {run.completedAt && (
                            <> • Completed {formatDateTime(run.completedAt)}</>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold">Filters</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Run ID
                    </label>
                    <Input
                      type="text"
                      value={entityFilters.runId || ''}
                      onChange={(e) => setEntityFilters({ ...entityFilters, runId: e.target.value || undefined })}
                      placeholder="Filter by run ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schema
                    </label>
                    <select
                      value={entityFilters.schemaId || ''}
                      onChange={(e) => setEntityFilters({ ...entityFilters, schemaId: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All schemas</option>
                      {schemas.map((schema) => (
                        <option key={schema.id} value={schema.id}>
                          {schema.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chat ID
                    </label>
                    <Input
                      type="text"
                      value={entityFilters.chatId || ''}
                      onChange={(e) => setEntityFilters({ ...entityFilters, chatId: e.target.value || undefined })}
                      placeholder="Filter by chat ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Size
                    </label>
                    <Input
                      type="number"
                      value={entityFilters.limit || 20}
                      onChange={(e) => setEntityFilters({ ...entityFilters, limit: parseInt(e.target.value) || 20, offset: 0 })}
                      placeholder="20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      value={entityFilters.sortBy || 'extractedAt'}
                      onChange={(e) => setEntityFilters({ ...entityFilters, sortBy: e.target.value, offset: 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="extractedAt">Extraction Date</option>
                      <option value="confidence">Confidence Score</option>
                      <option value="isLatest">Latest Status</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <select
                      value={entityFilters.sortOrder || 'desc'}
                      onChange={(e) => setEntityFilters({ ...entityFilters, sortOrder: e.target.value as 'asc' | 'desc', offset: 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEntityFilters({ limit: 20, offset: 0, sortBy: 'extractedAt', sortOrder: 'desc' })}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {entitiesLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            )}

            {/* Error State */}
            {entitiesError && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to load entities: {(entitiesError as any).message}</span>
              </Alert>
            )}

            {/* Empty State */}
            {!entitiesLoading && !entitiesError && entities.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Database className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No entities found</h3>
                  <p className="text-gray-500 max-w-sm">
                    No extracted entities match your filters. Try running an analysis or adjusting your filters.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Entities List */}
            {!entitiesLoading && !entitiesError && entities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {entities.length} {entities.length === 1 ? 'Entity' : 'Entities'} Found
                  </h2>
                </div>

                {entities.map((entity: any) => (
                  <Card key={entity.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{entity.entitySchemaName}</h3>
                              {entity.isLatest && (
                                <Badge variant="success">Latest</Badge>
                              )}
                              {entity.confidence !== null && (
                                <Badge variant="secondary">
                                  {Math.round(entity.confidence * 100)}% confidence
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>Run: {entity.runId.substring(0, 8)}</span>
                              {entity.chatId && (
                                <>
                                  <span>•</span>
                                  <span>Chat: {entity.chatId.substring(0, 8)}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{entity.sourceMessageIds.length} messages</span>
                              <span>•</span>
                              <span>Version {entity.profileVersion}</span>
                            </div>
                          </div>
                        </div>

                        {/* Properties */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Extracted Properties
                          </div>
                          <pre className="text-xs text-gray-800 overflow-x-auto">
                            {JSON.stringify(entity.properties, null, 2)}
                          </pre>
                        </div>

                        {/* Footer */}
                        <div className="text-xs text-gray-400 pt-2 border-t">
                          Extracted {formatDateTime(entity.extractedAt)}
                          <span className="ml-2">• Entity ID: {entity.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {(entityFilters.offset || 0) + 1} - {(entityFilters.offset || 0) + entities.length} (Page size: {entityFilters.limit || 20})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEntityFilters({
                        ...entityFilters,
                        offset: Math.max(0, (entityFilters.offset || 0) - (entityFilters.limit || 20))
                      })}
                      disabled={(entityFilters.offset || 0) === 0}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setEntityFilters({
                        ...entityFilters,
                        offset: (entityFilters.offset || 0) + (entityFilters.limit || 20)
                      })}
                      disabled={entities.length < (entityFilters.limit || 20)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
            {/* Loading State */}
            {statsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            )}

            {/* Error State */}
            {statsError && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to load statistics: {(statsError as any).message}</span>
              </Alert>
            )}

            {/* Stats Content */}
            {!statsLoading && !statsError && stats && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Runs</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.totalRuns}</p>
                        </div>
                        <Play className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Entities Extracted</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.totalEntitiesExtracted}</p>
                        </div>
                        <Database className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Tokens Used</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {stats.totalTokensUsed.toLocaleString()}
                          </p>
                        </div>
                        <Zap className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                          <p className="text-3xl font-bold text-gray-900">
                            ${stats.totalEstimatedCostUsd.toFixed(2)}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Runs by Status */}
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Runs by Status</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Completed</Badge>
                          <span className="text-sm text-gray-600">
                            {stats.runsByStatus.completed} runs
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {stats.totalRuns > 0
                            ? ((stats.runsByStatus.completed / stats.totalRuns) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="warning">Running</Badge>
                          <span className="text-sm text-gray-600">
                            {stats.runsByStatus.running} runs
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {stats.totalRuns > 0
                            ? ((stats.runsByStatus.running / stats.totalRuns) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Pending</Badge>
                          <span className="text-sm text-gray-600">
                            {stats.runsByStatus.pending} runs
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {stats.totalRuns > 0
                            ? ((stats.runsByStatus.pending / stats.totalRuns) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="error">Failed</Badge>
                          <span className="text-sm text-gray-600">
                            {stats.runsByStatus.failed} runs
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {stats.totalRuns > 0
                            ? ((stats.runsByStatus.failed / stats.totalRuns) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Cancelled</Badge>
                          <span className="text-sm text-gray-600">
                            {stats.runsByStatus.cancelled} runs
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {stats.totalRuns > 0
                            ? ((stats.runsByStatus.cancelled / stats.totalRuns) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Average Metrics</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Entities per run</span>
                          <span className="text-sm font-medium text-gray-900">
                            {stats.totalRuns > 0
                              ? (stats.totalEntitiesExtracted / stats.totalRuns).toFixed(1)
                              : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tokens per run</span>
                          <span className="text-sm font-medium text-gray-900">
                            {stats.totalRuns > 0
                              ? Math.round(stats.totalTokensUsed / stats.totalRuns).toLocaleString()
                              : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cost per run</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${stats.totalRuns > 0
                              ? (stats.totalEstimatedCostUsd / stats.totalRuns).toFixed(4)
                              : 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Success Rate</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completed runs</span>
                          <span className="text-sm font-medium text-green-600">
                            {stats.totalRuns > 0
                              ? ((stats.runsByStatus.completed / stats.totalRuns) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Failed runs</span>
                          <span className="text-sm font-medium text-red-600">
                            {stats.totalRuns > 0
                              ? ((stats.runsByStatus.failed / stats.totalRuns) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cancelled runs</span>
                          <span className="text-sm font-medium text-gray-600">
                            {stats.totalRuns > 0
                              ? ((stats.runsByStatus.cancelled / stats.totalRuns) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!statsLoading && !statsError && stats && stats.totalRuns === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No statistics yet</h3>
                  <p className="text-gray-500 max-w-sm">
                    Run your first analysis to see statistics here.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
