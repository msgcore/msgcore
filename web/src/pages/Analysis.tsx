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
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import {
  useEntitySchemas,
  useCreateEntitySchema,
  useDeleteEntitySchema,
  CreateEntitySchemaDto,
  useAnalysisProfiles,
  useCreateAnalysisProfile,
  useDeleteAnalysisProfile,
  CreateAnalysisProfileDto,
  useAnalysisRuns,
  useCreateAnalysisRun,
  useAnalysisRun,
  CreateAnalysisRunDto,
} from '../hooks/useAnalysis';
import { useProjectContext } from '../contexts/ProjectContext';
import { useConfirm } from '../hooks/useConfirm';
import { formatDateTime } from '../lib/utils';

type Tab = 'schemas' | 'profiles' | 'runs';

export function Analysis() {
  const { selectedProjectId } = useProjectContext();

  // Schemas
  const { data: schemas = [], isLoading, error } = useEntitySchemas(selectedProjectId || undefined);
  const createSchema = useCreateEntitySchema(selectedProjectId || undefined);
  const deleteSchema = useDeleteEntitySchema(selectedProjectId || undefined);

  // Profiles
  const { data: profiles = [], isLoading: profilesLoading, error: profilesError } = useAnalysisProfiles(selectedProjectId || undefined);
  const createProfile = useCreateAnalysisProfile(selectedProjectId || undefined);
  const deleteProfile = useDeleteAnalysisProfile(selectedProjectId || undefined);

  // Runs
  const { data: runs = [], isLoading: runsLoading, error: runsError } = useAnalysisRuns(selectedProjectId || undefined);
  const createRun = useCreateAnalysisRun(selectedProjectId || undefined);

  const { confirm, ConfirmDialog } = useConfirm();

  const [activeTab, setActiveTab] = useState<Tab>('schemas');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingSchemaId, setDeletingSchemaId] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [showCreateProfileForm, setShowCreateProfileForm] = useState(false);
  const [showCreateRunForm, setShowCreateRunForm] = useState(false);

  const [newSchema, setNewSchema] = useState<CreateEntitySchemaDto>({
    name: '',
    description: '',
    extractionType: 'llm_extraction',
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
    triggerOnReceive: false,
    triggerOnDemand: true,
    storeEntities: true,
    generateTags: false,
  });

  const [newRun, setNewRun] = useState<CreateAnalysisRunDto>({
    profileId: '',
    targetType: 'date_range',
    targetIds: [],
    dateRangeStart: '',
    dateRangeEnd: '',
  });

  const handleCreateSchema = async () => {
    if (!newSchema.name.trim()) return;

    try {
      const properties = JSON.parse(propertiesJson);
      await createSchema.mutateAsync({
        ...newSchema,
        properties,
      });

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
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create entity schema:', error);
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
      await createProfile.mutateAsync(newProfile);
      setNewProfile({
        name: '',
        description: '',
        graphDefinition: {},
        entitySchemaIds: [],
        triggerOnReceive: false,
        triggerOnDemand: true,
        storeEntities: true,
        generateTags: false,
      });
      setShowCreateProfileForm(false);
    } catch (error) {
      console.error('Failed to create analysis profile:', error);
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

    try {
      await createRun.mutateAsync(newRun);
      setNewRun({
        profileId: '',
        targetType: 'date_range',
        targetIds: [],
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
              onClick={() => setShowCreateForm(true)}
              disabled={showCreateForm}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schema
            </Button>
          )}
          {activeTab === 'profiles' && (
            <Button
              onClick={() => setShowCreateProfileForm(true)}
              disabled={showCreateProfileForm || schemas.length === 0}
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
          </nav>
        </div>

        {/* Schemas Tab */}
        {activeTab === 'schemas' && (
          <>
            {/* Create Form */}
            {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Create Entity Schema</h2>
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
                    Extraction Type *
                  </label>
                  <select
                    value={newSchema.extractionType}
                    onChange={(e) => setNewSchema({ ...newSchema, extractionType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="llm_extraction">LLM Extraction (OpenRouter)</option>
                    <option value="rule_based">Rule-Based (Regex)</option>
                    <option value="api_logged">API Logged (External)</option>
                  </select>
                </div>

                {newSchema.extractionType === 'llm_extraction' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <select
                        value={newSchema.model}
                        onChange={(e) => setNewSchema({ ...newSchema, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Fast & Cheap)</option>
                        <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Balanced)</option>
                        <option value="anthropic/claude-3-opus">Claude 3 Opus (Powerful)</option>
                        <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
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
                  </>
                )}

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
                    disabled={createSchema.isPending || !newSchema.name.trim()}
                    variant="primary"
                  >
                    {createSchema.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Schema
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)} variant="secondary">
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
              <Button onClick={() => setShowCreateForm(true)} variant="primary">
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
                </CardHeader>
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
            {/* Create Profile Form */}
            {showCreateProfileForm && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-lg font-semibold">Create Analysis Profile</h2>
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
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Trigger Options</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newProfile.triggerOnReceive}
                            onChange={(e) => setNewProfile({ ...newProfile, triggerOnReceive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Trigger on message receive (real-time)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newProfile.triggerOnDemand}
                            onChange={(e) => setNewProfile({ ...newProfile, triggerOnDemand: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Allow on-demand runs</span>
                        </label>
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
                        disabled={createProfile.isPending || !newProfile.name.trim() || newProfile.entitySchemaIds.length === 0}
                        variant="primary"
                      >
                        {createProfile.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Profile
                          </>
                        )}
                      </Button>
                      <Button onClick={() => setShowCreateProfileForm(false)} variant="secondary">
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
                    <Button onClick={() => setShowCreateProfileForm(true)} variant="primary">
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
                          {profile.triggerOnReceive && (
                            <Badge variant="blue" size="sm">Auto-trigger</Badge>
                          )}
                          {profile.triggerOnDemand && (
                            <Badge variant="green" size="sm">On-demand</Badge>
                          )}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Type *
                      </label>
                      <select
                        value={newRun.targetType}
                        onChange={(e) => setNewRun({ ...newRun, targetType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="date_range">Date Range</option>
                        <option value="chat">Specific Chat</option>
                        <option value="message">Specific Messages</option>
                        <option value="identity">Specific Identity</option>
                      </select>
                    </div>

                    {newRun.targetType === 'date_range' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={newRun.dateRangeStart}
                            onChange={(e) => setNewRun({ ...newRun, dateRangeStart: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={newRun.dateRangeEnd}
                            onChange={(e) => setNewRun({ ...newRun, dateRangeEnd: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {newRun.targetType !== 'date_range' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target IDs (comma-separated)
                        </label>
                        <Input
                          type="text"
                          value={newRun.targetIds.join(', ')}
                          onChange={(e) => setNewRun({ ...newRun, targetIds: e.target.value.split(',').map(id => id.trim()) })}
                          placeholder="e.g., chat-1, chat-2, chat-3"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter {newRun.targetType} IDs separated by commas
                        </p>
                      </div>
                    )}

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
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Profile: {run.profileId} (v{run.profileVersion})
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Target:</span>
                            <span className="ml-2 font-medium">{run.targetType}</span>
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
      </div>
    </>
  );
}
