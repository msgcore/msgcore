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
} from '../hooks/useAnalysis';
import { useProjectContext } from '../contexts/ProjectContext';
import { useConfirm } from '../hooks/useConfirm';
import { formatDateTime } from '../lib/utils';

type Tab = 'schemas' | 'profiles' | 'runs';

export function Analysis() {
  const { selectedProjectId } = useProjectContext();
  const { data: schemas = [], isLoading, error } = useEntitySchemas(selectedProjectId || undefined);
  const createSchema = useCreateEntitySchema(selectedProjectId || undefined);
  const deleteSchema = useDeleteEntitySchema(selectedProjectId || undefined);
  const { confirm, ConfirmDialog } = useConfirm();

  const [activeTab, setActiveTab] = useState<Tab>('schemas');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingSchemaId, setDeletingSchemaId] = useState<string | null>(null);

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
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Profiles</h3>
              <p className="text-gray-500">
                Coming soon: Create versioned analysis pipelines combining multiple schemas
              </p>
            </CardContent>
          </Card>
        )}

        {/* Runs Tab */}
        {activeTab === 'runs' && (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Runs</h3>
              <p className="text-gray-500">
                Coming soon: Execute analysis over message history and view extracted entities
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
