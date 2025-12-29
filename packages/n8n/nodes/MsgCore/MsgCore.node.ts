import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MsgCore implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MsgCore',
    name: 'MsgCore',
    icon: 'file:msgcore.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Universal messaging gateway - send messages across multiple platforms',
    defaults: {
      name: 'MsgCore',
    },
    inputs: ['main'],
    outputs: ['main'],
    usableAsTool: true,
    credentials: [
      {
        name: 'MsgCoreApi',
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: '={{$credentials.apiUrl}}',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      {
      displayName: 'Resource',
      name: 'resource',
      type: 'options',
      noDataExpression: true,
      options: [
        { name: 'Analysis / Entities', value: 'analysis / entities' },
        { name: 'Analysis / Models', value: 'analysis / models' },
        { name: 'Analysis / Profiles', value: 'analysis / profiles' },
        { name: 'Analysis / Runs', value: 'analysis / runs' },
        { name: 'Analysis / Schemas', value: 'analysis / schemas' },
        { name: 'ApiKeys', value: 'apikeys' },
        { name: 'Auth', value: 'auth' },
        { name: 'Billing', value: 'billing' },
        { name: 'Chats', value: 'chats' },
        { name: 'Identities', value: 'identities' },
        { name: 'Members', value: 'members' },
        { name: 'Messages', value: 'messages' },
        { name: 'Platform Logs', value: 'platform logs' },
        { name: 'Platforms', value: 'platforms' },
        { name: 'Projects', value: 'projects' },
        { name: 'Webhooks', value: 'webhooks' }
      ],
      default: 'analysis / entities',
    },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['analysis / entities'],
          },
        },
        options: [
          {
          name: 'Entities',
          value: 'entities',
          action: 'List all extracted entities for a project with pagination and sorting',
          description: 'List all extracted entities for a project with pagination and sorting',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/entities',
              
            },
          },
        },
          {
          name: 'Entities',
          value: 'entities',
          action: 'Get a specific extracted entity by ID',
          description: 'Get a specific extracted entity by ID',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/entities/{{ $parameter["id"] }}',
              
            },
          },
        }
        ],
        default: 'entities',
      },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / entities'],
              operation: ['entities'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / entities'],
              operation: ['entities'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['analysis / entities'],
              operation: ['entities'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['analysis / models'],
          },
        },
        options: [
          {
          name: 'Models',
          value: 'models',
          action: 'List available LLM models from OpenRouter for analysis',
          description: 'List available LLM models from OpenRouter for analysis',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/analysis/models',
              
            },
          },
        }
        ],
        default: 'models',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['analysis / profiles'],
          },
        },
        options: [
          {
          name: 'Profiles',
          value: 'profiles',
          action: 'Create a new analysis profile (versioned pipeline)',
          description: 'Create a new analysis profile (versioned pipeline)',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/profiles',
              body: {},
            },
          },
        },
          {
          name: 'Profiles',
          value: 'profiles',
          action: 'List all analysis profiles for a project',
          description: 'List all analysis profiles for a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/profiles',
              
            },
          },
        },
          {
          name: 'Profiles',
          value: 'profiles',
          action: 'Get a specific analysis profile',
          description: 'Get a specific analysis profile',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/profiles/{{ $parameter["profileId"] }}',
              
            },
          },
        },
          {
          name: 'Profiles',
          value: 'profiles',
          action: 'Update an analysis profile',
          description: 'Update an analysis profile',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/profiles/{{ $parameter["profileId"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Profiles',
          value: 'profiles',
          action: 'Delete an analysis profile (soft delete)',
          description: 'Delete an analysis profile (soft delete)',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/profiles/{{ $parameter["profileId"] }}',
              
            },
          },
        }
        ],
        default: 'profiles',
      },
      {
            displayName: 'Profile name',
            name: 'name',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / profiles'],
                operation: ['profiles'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Profile description',
            name: 'description',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / profiles'],
                operation: ['profiles'],
              },
            },
            routing: {
              request: {
                qs: {
                  'description': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Analysis graph definition (JSON)',
            name: 'graphDefinition',
            type: 'json',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / profiles'],
                operation: ['profiles'],
              },
            },
            routing: {
              request: {
                body: {
                  'graphDefinition': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Entity schema IDs (JSON array)',
            name: 'entitySchemaIds',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / profiles'],
                operation: ['profiles'],
              },
            },
            routing: {
              request: {
                qs: {
                  'entitySchemaIds': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Store extracted entities',
            name: 'storeEntities',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / profiles'],
                operation: ['profiles'],
              },
            },
            routing: {
              request: {
                qs: {
                  'storeEntities': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Generate tags from analysis',
            name: 'generateTags',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / profiles'],
                operation: ['profiles'],
              },
            },
            routing: {
              request: {
                qs: {
                  'generateTags': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
          displayName: 'ProfileId',
          name: 'profileId',
          type: 'string',
          required: true,
          default: '',
          description: 'profileId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
          displayName: 'ProfileId',
          name: 'profileId',
          type: 'string',
          required: true,
          default: '',
          description: 'profileId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
          displayName: 'ProfileId',
          name: 'profileId',
          type: 'string',
          required: true,
          default: '',
          description: 'profileId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / profiles'],
              operation: ['profiles'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['analysis / runs'],
          },
        },
        options: [
          {
          name: 'Runs',
          value: 'runs',
          action: 'Execute an analysis run with a profile',
          description: 'Execute an analysis run with a profile',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/runs',
              body: {},
            },
          },
        },
          {
          name: 'Runs',
          value: 'runs',
          action: 'Get analysis run statistics for a project',
          description: 'Get analysis run statistics for a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/runs/stats',
              
            },
          },
        },
          {
          name: 'Runs',
          value: 'runs',
          action: 'List analysis runs for a project with sorting',
          description: 'List analysis runs for a project with sorting',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/runs',
              
            },
          },
        },
          {
          name: 'Runs',
          value: 'runs',
          action: 'Get analysis run status and results',
          description: 'Get analysis run status and results',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/runs/{{ $parameter["runId"] }}',
              
            },
          },
        },
          {
          name: 'Runs',
          value: 'runs',
          action: 'Cancel a running or pending analysis run',
          description: 'Cancel a running or pending analysis run',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/runs/{{ $parameter["runId"] }}/cancel',
              
            },
          },
        }
        ],
        default: 'runs',
      },
      {
            displayName: 'Analysis profile ID',
            name: 'profileId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / runs'],
                operation: ['runs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'profileId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by chat IDs (JSON array)',
            name: 'chatIds',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / runs'],
                operation: ['runs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'chatIds': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by identity IDs (JSON array)',
            name: 'identityIds',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / runs'],
                operation: ['runs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'identityIds': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Start date for analysis (ISO 8601)',
            name: 'dateRangeStart',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / runs'],
                operation: ['runs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'dateRangeStart': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'End date for analysis (ISO 8601)',
            name: 'dateRangeEnd',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / runs'],
                operation: ['runs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'dateRangeEnd': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / runs'],
              operation: ['runs'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / runs'],
              operation: ['runs'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / runs'],
              operation: ['runs'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / runs'],
              operation: ['runs'],
            },
          },
        },
      {
          displayName: 'RunId',
          name: 'runId',
          type: 'string',
          required: true,
          default: '',
          description: 'runId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / runs'],
              operation: ['runs'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / runs'],
              operation: ['runs'],
            },
          },
        },
      {
          displayName: 'RunId',
          name: 'runId',
          type: 'string',
          required: true,
          default: '',
          description: 'runId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / runs'],
              operation: ['runs'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['analysis / schemas'],
          },
        },
        options: [
          {
          name: 'Schemas',
          value: 'schemas',
          action: 'Create a new entity schema for custom extraction',
          description: 'Create a new entity schema for custom extraction',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/schemas/entities',
              body: {},
            },
          },
        },
          {
          name: 'Schemas',
          value: 'schemas',
          action: 'List all entity schemas for a project',
          description: 'List all entity schemas for a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/schemas/entities',
              
            },
          },
        },
          {
          name: 'Schemas',
          value: 'schemas',
          action: 'Get a specific entity schema',
          description: 'Get a specific entity schema',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/schemas/entities/{{ $parameter["schemaId"] }}',
              
            },
          },
        },
          {
          name: 'Schemas',
          value: 'schemas',
          action: 'Update an entity schema',
          description: 'Update an entity schema',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/schemas/entities/{{ $parameter["schemaId"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Schemas',
          value: 'schemas',
          action: 'Delete an entity schema (soft delete)',
          description: 'Delete an entity schema (soft delete)',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/analysis/schemas/entities/{{ $parameter["schemaId"] }}',
              
            },
          },
        }
        ],
        default: 'schemas',
      },
      {
            displayName: 'Project ID',
            name: 'project',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'project': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Schema name',
            name: 'name',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Extraction type (llm_extraction, rule_based, api_logged)',
            name: 'extractionType',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'extractionType': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'JSON schema for entity properties',
            name: 'properties',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'properties': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'LLM prompt (for llm_extraction)',
            name: 'prompt',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'prompt': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Schema description',
            name: 'description',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'description': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
            displayName: 'Project ID',
            name: 'project',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'project': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
            displayName: 'Project ID',
            name: 'project',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'project': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Schema ID',
            name: 'schemaId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'schemaId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
          displayName: 'SchemaId',
          name: 'schemaId',
          type: 'string',
          required: true,
          default: '',
          description: 'schemaId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
            displayName: 'Project ID',
            name: 'project',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'project': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Schema ID',
            name: 'schemaId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'schemaId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'New schema name',
            name: 'name',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'New LLM prompt',
            name: 'prompt',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'prompt': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
          displayName: 'SchemaId',
          name: 'schemaId',
          type: 'string',
          required: true,
          default: '',
          description: 'schemaId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
            displayName: 'Project ID',
            name: 'project',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'project': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Schema ID',
            name: 'schemaId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['analysis / schemas'],
                operation: ['schemas'],
              },
            },
            routing: {
              request: {
                qs: {
                  'schemaId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
          displayName: 'SchemaId',
          name: 'schemaId',
          type: 'string',
          required: true,
          default: '',
          description: 'schemaId parameter',
          displayOptions: {
            show: {
              resource: ['analysis / schemas'],
              operation: ['schemas'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['apikeys'],
          },
        },
        options: [
          {
          name: 'Create',
          value: 'create',
          action: 'Generate a new API key',
          description: 'Generate a new API key',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/keys',
              body: {},
            },
          },
        },
          {
          name: 'List',
          value: 'list',
          action: 'List all API keys for project',
          description: 'List all API keys for project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/keys',
              
            },
          },
        },
          {
          name: 'Revoke',
          value: 'revoke',
          action: 'Revoke an API key',
          description: 'Revoke an API key',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/keys/{{ $parameter["keyId"] }}',
              
            },
          },
        },
          {
          name: 'Roll',
          value: 'roll',
          action: 'Roll an API key (generate new key, revoke old after 24h)',
          description: 'Roll an API key (generate new key, revoke old after 24h)',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/keys/{{ $parameter["keyId"] }}/roll',
              
            },
          },
        }
        ],
        default: 'create',
      },
      {
            displayName: 'API key name',
            name: 'name',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['apikeys'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Array of scope strings (e.g., ["messages:read", "messages:write"])',
            name: 'scopes',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['apikeys'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'scopes': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Expiration in days',
            name: 'expiresInDays',
            type: 'number',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['apikeys'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'expiresInDays': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['apikeys'],
              operation: ['create'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['apikeys'],
              operation: ['list'],
            },
          },
        },
      {
            displayName: 'API key ID to revoke',
            name: 'keyId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['apikeys'],
                operation: ['revoke'],
              },
            },
            routing: {
              request: {
                qs: {
                  'keyId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['apikeys'],
              operation: ['revoke'],
            },
          },
        },
      {
          displayName: 'KeyId',
          name: 'keyId',
          type: 'string',
          required: true,
          default: '',
          description: 'keyId parameter',
          displayOptions: {
            show: {
              resource: ['apikeys'],
              operation: ['revoke'],
            },
          },
        },
      {
            displayName: 'API key ID to roll',
            name: 'keyId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['apikeys'],
                operation: ['roll'],
              },
            },
            routing: {
              request: {
                qs: {
                  'keyId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['apikeys'],
              operation: ['roll'],
            },
          },
        },
      {
          displayName: 'KeyId',
          name: 'keyId',
          type: 'string',
          required: true,
          default: '',
          description: 'keyId parameter',
          displayOptions: {
            show: {
              resource: ['apikeys'],
              operation: ['roll'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['auth'],
          },
        },
        options: [
          {
          name: 'Signup',
          value: 'signup',
          action: 'Create a new user account (first user becomes admin)',
          description: 'Create a new user account (first user becomes admin)',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/auth/signup',
              body: {},
            },
          },
        },
          {
          name: 'Login',
          value: 'login',
          action: 'Login with email and password',
          description: 'Login with email and password',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/auth/login',
              body: {},
            },
          },
        },
          {
          name: 'Accept-invite',
          value: 'accept-invite',
          action: 'Accept a project invitation and create account',
          description: 'Accept a project invitation and create account',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/auth/accept-invite',
              body: {},
            },
          },
        },
          {
          name: 'Whoami',
          value: 'whoami',
          action: 'Get current authentication context and permissions',
          description: 'Get current authentication context and permissions',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/auth/whoami',
              
            },
          },
        },
          {
          name: 'Update-password',
          value: 'update-password',
          action: 'Update your password (requires current password)',
          description: 'Update your password (requires current password)',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/auth/password',
              body: {},
            },
          },
        },
          {
          name: 'Update-profile',
          value: 'update-profile',
          action: 'Update your profile information',
          description: 'Update your profile information',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/auth/profile',
              body: {},
            },
          },
        }
        ],
        default: 'signup',
      },
      {
            displayName: 'Email address',
            name: 'email',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['signup'],
              },
            },
            routing: {
              request: {
                qs: {
                  'email': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Password (min 8 chars, 1 uppercase, 1 number)',
            name: 'password',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['signup'],
              },
            },
            routing: {
              request: {
                qs: {
                  'password': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Full name',
            name: 'name',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['signup'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Email address',
            name: 'email',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['login'],
              },
            },
            routing: {
              request: {
                qs: {
                  'email': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Password',
            name: 'password',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['login'],
              },
            },
            routing: {
              request: {
                qs: {
                  'password': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Invite token from invitation link',
            name: 'token',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['accept-invite'],
              },
            },
            routing: {
              request: {
                qs: {
                  'token': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Full name',
            name: 'name',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['accept-invite'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Password (min 8 chars, 1 uppercase, 1 number)',
            name: 'password',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['accept-invite'],
              },
            },
            routing: {
              request: {
                qs: {
                  'password': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Current password',
            name: 'currentPassword',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['update-password'],
              },
            },
            routing: {
              request: {
                qs: {
                  'currentPassword': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'New password (min 8 chars, 1 uppercase, 1 number)',
            name: 'newPassword',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['update-password'],
              },
            },
            routing: {
              request: {
                qs: {
                  'newPassword': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Full name',
            name: 'name',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['auth'],
                operation: ['update-profile'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['billing'],
          },
        },
        options: [
          {
          name: 'Checkout',
          value: 'checkout',
          action: 'Create Stripe checkout session for subscription upgrade',
          description: 'Create Stripe checkout session for subscription upgrade',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/billing/checkout',
              body: {},
            },
          },
        },
          {
          name: 'Portal',
          value: 'portal',
          action: 'Access Stripe customer portal to manage subscription',
          description: 'Access Stripe customer portal to manage subscription',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/billing/portal',
              
            },
          },
        },
          {
          name: 'Subscription',
          value: 'subscription',
          action: 'Get current subscription details including tier, status, and trial info',
          description: 'Get current subscription details including tier, status, and trial info',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/billing/subscription',
              
            },
          },
        },
          {
          name: 'Usage',
          value: 'usage',
          action: 'Get usage statistics for projects, messages, platforms, webhooks with limit warnings',
          description: 'Get usage statistics for projects, messages, platforms, webhooks with limit warnings',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/billing/usage',
              
            },
          },
        },
          {
          name: 'Sync',
          value: 'sync',
          action: 'Manually sync subscription data from Stripe',
          description: 'Manually sync subscription data from Stripe',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/billing/sync',
              
            },
          },
        }
        ],
        default: 'checkout',
      },
      {
            displayName: 'Subscription tier',
            name: 'tier',
            type: 'string',
            required: true,
            default: "",
            options: [{name: 'STARTER', value: 'STARTER'}, {name: 'PRO', value: 'PRO'}, {name: 'BUSINESS', value: 'BUSINESS'}, {name: 'ENTERPRISE', value: 'ENTERPRISE'}],
            displayOptions: {
              show: {
                resource: ['billing'],
                operation: ['checkout'],
              },
            },
            routing: {
              request: {
                qs: {
                  'tier': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Billing interval',
            name: 'interval',
            type: 'string',
            required: true,
            default: "",
            options: [{name: 'monthly', value: 'monthly'}, {name: 'annual', value: 'annual'}],
            displayOptions: {
              show: {
                resource: ['billing'],
                operation: ['checkout'],
              },
            },
            routing: {
              request: {
                qs: {
                  'interval': '={{$value}}',
                },
              },
            },
          },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['chats'],
          },
        },
        options: [
          {
          name: 'List',
          value: 'list',
          action: 'List all chats for a project with filtering and pagination',
          description: 'List all chats for a project with filtering and pagination',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/chats',
              body: {},
            },
          },
        },
          {
          name: 'Get',
          value: 'get',
          action: 'Get details of a specific chat',
          description: 'Get details of a specific chat',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/chats/{{ $parameter["chatId"] }}',
              
            },
          },
        },
          {
          name: 'Messages',
          value: 'messages',
          action: 'Get messages for a specific chat with pagination',
          description: 'Get messages for a specific chat with pagination',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/chats/{{ $parameter["chatId"] }}/messages',
              
            },
          },
        },
          {
          name: 'Update',
          value: 'update',
          action: 'Update chat metadata (name, avatar, custom metadata)',
          description: 'Update chat metadata (name, avatar, custom metadata)',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/chats/{{ $parameter["chatId"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Sync-all',
          value: 'sync-all',
          action: 'Sync all chats and their messages from all platforms',
          description: 'Sync all chats and their messages from all platforms',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/chats/sync-all',
              body: {},
            },
          },
        },
          {
          name: 'Sync',
          value: 'sync',
          action: 'Sync historical messages for a specific chat from the platform provider',
          description: 'Sync historical messages for a specific chat from the platform provider',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/chats/{{ $parameter["chatId"] }}/sync',
              body: {},
            },
          },
        }
        ],
        default: 'list',
      },
      {
            displayName: 'Filter by platform ID',
            name: 'platformId',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by chat type (individual, group, channel)',
            name: 'chatType',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'individual', value: 'individual'}, {name: 'group', value: 'group'}, {name: 'channel', value: 'channel'}],
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'chatType': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Search chats by name or provider chat ID',
            name: 'search',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'search': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of chats to return',
            name: 'limit',
            type: 'number',
            required: false,
            default: 50,
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of chats to skip',
            name: 'offset',
            type: 'number',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'offset': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['list'],
            },
          },
        },
      {
            displayName: 'Chat ID',
            name: 'chatId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['get'],
              },
            },
            routing: {
              request: {
                qs: {
                  'chatId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['get'],
            },
          },
        },
      {
          displayName: 'ChatId',
          name: 'chatId',
          type: 'string',
          required: true,
          default: '',
          description: 'chatId parameter',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['get'],
            },
          },
        },
      {
            displayName: 'Chat ID',
            name: 'chatId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['messages'],
              },
            },
            routing: {
              request: {
                qs: {
                  'chatId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of messages to return',
            name: 'limit',
            type: 'number',
            required: false,
            default: 50,
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['messages'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of messages to skip',
            name: 'offset',
            type: 'number',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['messages'],
              },
            },
            routing: {
              request: {
                qs: {
                  'offset': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['messages'],
            },
          },
        },
      {
          displayName: 'ChatId',
          name: 'chatId',
          type: 'string',
          required: true,
          default: '',
          description: 'chatId parameter',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['messages'],
            },
          },
        },
      {
            displayName: 'Chat ID',
            name: 'chatId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'chatId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Chat display name',
            name: 'name',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Chat avatar URL',
            name: 'avatarUrl',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'avatarUrl': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Custom metadata (JSON string)',
            name: 'metadata',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'metadata': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['update'],
            },
          },
        },
      {
          displayName: 'ChatId',
          name: 'chatId',
          type: 'string',
          required: true,
          default: '',
          description: 'chatId parameter',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['update'],
            },
          },
        },
      {
            displayName: 'Optional: Sync only chats from specific platform',
            name: 'platformId',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync-all'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Start date for history sync (ISO 8601)',
            name: 'startDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync-all'],
              },
            },
            routing: {
              request: {
                qs: {
                  'startDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'End date for history sync (ISO 8601)',
            name: 'endDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync-all'],
              },
            },
            routing: {
              request: {
                qs: {
                  'endDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Maximum number of messages to sync per chat (1-1000)',
            name: 'limit',
            type: 'number',
            required: false,
            default: 100,
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync-all'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['sync-all'],
            },
          },
        },
      {
            displayName: 'Chat ID',
            name: 'chatId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync'],
              },
            },
            routing: {
              request: {
                qs: {
                  'chatId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Start date for history sync (ISO 8601)',
            name: 'startDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync'],
              },
            },
            routing: {
              request: {
                qs: {
                  'startDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'End date for history sync (ISO 8601)',
            name: 'endDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync'],
              },
            },
            routing: {
              request: {
                qs: {
                  'endDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Maximum number of messages to sync (1-1000)',
            name: 'limit',
            type: 'number',
            required: false,
            default: 100,
            
            displayOptions: {
              show: {
                resource: ['chats'],
                operation: ['sync'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['sync'],
            },
          },
        },
      {
          displayName: 'ChatId',
          name: 'chatId',
          type: 'string',
          required: true,
          default: '',
          description: 'chatId parameter',
          displayOptions: {
            show: {
              resource: ['chats'],
              operation: ['sync'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['identities'],
          },
        },
        options: [
          {
          name: 'Create',
          value: 'create',
          action: 'Create a new identity with platform aliases',
          description: 'Create a new identity with platform aliases',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities',
              body: {},
            },
          },
        },
          {
          name: 'List',
          value: 'list',
          action: 'List all identities for a project',
          description: 'List all identities for a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities',
              
            },
          },
        },
          {
          name: 'Search',
          value: 'search',
          action: 'Search identities by display name or email',
          description: 'Search identities by display name or email',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/search',
              
            },
          },
        },
          {
          name: 'Quick-link',
          value: 'quick-link',
          action: 'Create identity and link platform user in one operation',
          description: 'Create identity and link platform user in one operation',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/quick-link',
              body: {},
            },
          },
        },
          {
          name: 'Lookup',
          value: 'lookup',
          action: 'Lookup identity by platform user ID (returns null if not found)',
          description: 'Lookup identity by platform user ID (returns null if not found)',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/lookup',
              
            },
          },
        },
          {
          name: 'Get',
          value: 'get',
          action: 'Get a specific identity by ID',
          description: 'Get a specific identity by ID',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/{{ $parameter["id"] }}',
              
            },
          },
        },
          {
          name: 'Update',
          value: 'update',
          action: 'Update identity metadata (display name, email, metadata)',
          description: 'Update identity metadata (display name, email, metadata)',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/{{ $parameter["id"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Add-alias',
          value: 'add-alias',
          action: 'Add a platform alias to an existing identity',
          description: 'Add a platform alias to an existing identity',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/{{ $parameter["id"] }}/aliases',
              body: {},
            },
          },
        },
          {
          name: 'Remove-alias',
          value: 'remove-alias',
          action: 'Remove a platform alias from an identity',
          description: 'Remove a platform alias from an identity',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/{{ $parameter["id"] }}/aliases/{{ $parameter["aliasId"] }}',
              
            },
          },
        },
          {
          name: 'Delete',
          value: 'delete',
          action: 'Delete an identity and all its aliases',
          description: 'Delete an identity and all its aliases',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/{{ $parameter["id"] }}',
              
            },
          },
        },
          {
          name: 'Messages',
          value: 'messages',
          action: 'Get all messages for an identity (across all linked platform accounts)',
          description: 'Get all messages for an identity (across all linked platform accounts)',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/{{ $parameter["id"] }}/messages',
              
            },
          },
        },
          {
          name: 'Reactions',
          value: 'reactions',
          action: 'Get all reactions for an identity (across all linked platform accounts)',
          description: 'Get all reactions for an identity (across all linked platform accounts)',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/identities/{{ $parameter["id"] }}/reactions',
              
            },
          },
        }
        ],
        default: 'create',
      },
      {
            displayName: 'Display name for the identity',
            name: 'displayName',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'displayName': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Email address for the identity',
            name: 'email',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'email': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'JSON metadata for the identity',
            name: 'metadata',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'metadata': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'JSON array of platform aliases',
            name: 'aliases',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'aliases': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['create'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['list'],
            },
          },
        },
      {
            displayName: 'Search query (min 2 characters)',
            name: 'q',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['search'],
              },
            },
            routing: {
              request: {
                qs: {
                  'q': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['search'],
            },
          },
        },
      {
            displayName: 'Platform configuration ID',
            name: 'platformId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['quick-link'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Provider-specific user ID',
            name: 'providerUserId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['quick-link'],
              },
            },
            routing: {
              request: {
                qs: {
                  'providerUserId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Display name on the platform',
            name: 'providerUserDisplay',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['quick-link'],
              },
            },
            routing: {
              request: {
                qs: {
                  'providerUserDisplay': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Display name for the new identity',
            name: 'displayName',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['quick-link'],
              },
            },
            routing: {
              request: {
                qs: {
                  'displayName': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Email address for the new identity',
            name: 'email',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['quick-link'],
              },
            },
            routing: {
              request: {
                qs: {
                  'email': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['quick-link'],
            },
          },
        },
      {
            displayName: 'Platform configuration ID',
            name: 'platformId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['lookup'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Provider-specific user ID',
            name: 'providerUserId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['lookup'],
              },
            },
            routing: {
              request: {
                qs: {
                  'providerUserId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['lookup'],
            },
          },
        },
      {
            displayName: 'Identity ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['get'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['get'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['get'],
            },
          },
        },
      {
            displayName: 'Identity ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Updated display name',
            name: 'displayName',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'displayName': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Updated email address',
            name: 'email',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'email': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Updated JSON metadata',
            name: 'metadata',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'metadata': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['update'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['update'],
            },
          },
        },
      {
            displayName: 'Identity ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['add-alias'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Platform configuration ID',
            name: 'platformId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['add-alias'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Provider-specific user ID',
            name: 'providerUserId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['add-alias'],
              },
            },
            routing: {
              request: {
                qs: {
                  'providerUserId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Display name on the platform',
            name: 'providerUserDisplay',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['add-alias'],
              },
            },
            routing: {
              request: {
                qs: {
                  'providerUserDisplay': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['add-alias'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['add-alias'],
            },
          },
        },
      {
            displayName: 'Identity ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['remove-alias'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Alias ID to remove',
            name: 'aliasId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['remove-alias'],
              },
            },
            routing: {
              request: {
                qs: {
                  'aliasId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['remove-alias'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['remove-alias'],
            },
          },
        },
      {
          displayName: 'AliasId',
          name: 'aliasId',
          type: 'string',
          required: true,
          default: '',
          description: 'aliasId parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['remove-alias'],
            },
          },
        },
      {
            displayName: 'Identity ID to delete',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['delete'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['delete'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['delete'],
            },
          },
        },
      {
            displayName: 'Identity ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['messages'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['messages'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['messages'],
            },
          },
        },
      {
            displayName: 'Identity ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['identities'],
                operation: ['reactions'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['reactions'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['identities'],
              operation: ['reactions'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['members'],
          },
        },
        options: [
          {
          name: 'List',
          value: 'list',
          action: 'List all members of a project',
          description: 'List all members of a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/members',
              
            },
          },
        },
          {
          name: 'Add',
          value: 'add',
          action: 'Add a member to a project',
          description: 'Add a member to a project',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/members',
              body: {},
            },
          },
        },
          {
          name: 'Update',
          value: 'update',
          action: 'Update a member role in a project',
          description: 'Update a member role in a project',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/members/{{ $parameter["userId"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Remove',
          value: 'remove',
          action: 'Remove a member from a project',
          description: 'Remove a member from a project',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/members/{{ $parameter["userId"] }}',
              
            },
          },
        },
          {
          name: 'Invite',
          value: 'invite',
          action: 'Invite a user to join a project',
          description: 'Invite a user to join a project',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/members/invite',
              body: {},
            },
          },
        }
        ],
        default: 'list',
      },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['members'],
              operation: ['list'],
            },
          },
        },
      {
            displayName: 'Email of user to add',
            name: 'email',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['members'],
                operation: ['add'],
              },
            },
            routing: {
              request: {
                qs: {
                  'email': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Role to assign to the member',
            name: 'role',
            type: 'string',
            required: true,
            default: "",
            options: [{name: 'owner', value: 'owner'}, {name: 'admin', value: 'admin'}, {name: 'member', value: 'member'}, {name: 'viewer', value: 'viewer'}],
            displayOptions: {
              show: {
                resource: ['members'],
                operation: ['add'],
              },
            },
            routing: {
              request: {
                qs: {
                  'role': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['members'],
              operation: ['add'],
            },
          },
        },
      {
            displayName: 'User ID of the member to update',
            name: 'userId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['members'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'userId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'New role to assign',
            name: 'role',
            type: 'string',
            required: true,
            default: "",
            options: [{name: 'admin', value: 'admin'}, {name: 'member', value: 'member'}, {name: 'viewer', value: 'viewer'}],
            displayOptions: {
              show: {
                resource: ['members'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'role': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['members'],
              operation: ['update'],
            },
          },
        },
      {
          displayName: 'UserId',
          name: 'userId',
          type: 'string',
          required: true,
          default: '',
          description: 'userId parameter',
          displayOptions: {
            show: {
              resource: ['members'],
              operation: ['update'],
            },
          },
        },
      {
            displayName: 'User ID of the member to remove',
            name: 'userId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['members'],
                operation: ['remove'],
              },
            },
            routing: {
              request: {
                qs: {
                  'userId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['members'],
              operation: ['remove'],
            },
          },
        },
      {
          displayName: 'UserId',
          name: 'userId',
          type: 'string',
          required: true,
          default: '',
          description: 'userId parameter',
          displayOptions: {
            show: {
              resource: ['members'],
              operation: ['remove'],
            },
          },
        },
      {
            displayName: 'Email address of user to invite',
            name: 'email',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['members'],
                operation: ['invite'],
              },
            },
            routing: {
              request: {
                qs: {
                  'email': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['members'],
              operation: ['invite'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['messages'],
          },
        },
        options: [
          {
          name: 'List',
          value: 'list',
          action: 'List messages for a project (sent and received)',
          description: 'List messages for a project (sent and received)',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages',
              body: {},
            },
          },
        },
          {
          name: 'Stats',
          value: 'stats',
          action: 'Get message statistics for a project',
          description: 'Get message statistics for a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/stats',
              
            },
          },
        },
          {
          name: 'Get',
          value: 'get',
          action: 'Get a specific message by ID',
          description: 'Get a specific message by ID',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/{{ $parameter["messageId"] }}',
              
            },
          },
        },
          {
          name: 'Cleanup',
          value: 'cleanup',
          action: 'Delete messages older than specified days',
          description: 'Delete messages older than specified days',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/cleanup',
              
            },
          },
        },
          {
          name: 'Send',
          value: 'send',
          action: 'Send a message to platforms',
          description: 'Send a message to platforms',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/send',
              body: {},
            },
          },
        },
          {
          name: 'Status',
          value: 'status',
          action: 'Check message delivery status',
          description: 'Check message delivery status',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/status/{{ $parameter["jobId"] }}',
              
            },
          },
        },
          {
          name: 'Retry',
          value: 'retry',
          action: 'Retry a failed message',
          description: 'Retry a failed message',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/retry/{{ $parameter["jobId"] }}',
              
            },
          },
        },
          {
          name: 'React',
          value: 'react',
          action: 'Add a reaction to a message',
          description: 'Add a reaction to a message',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/react',
              body: {},
            },
          },
        },
          {
          name: 'Unreact',
          value: 'unreact',
          action: 'Remove a reaction from a message',
          description: 'Remove a reaction from a message',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/messages/unreact',
              body: {},
            },
          },
        }
        ],
        default: 'list',
      },
      {
            displayName: 'Filter by platform ID',
            name: 'platformId',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by chat/channel ID',
            name: 'chatId',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'chatId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by user ID',
            name: 'userId',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'userId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by message direction',
            name: 'direction',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'sent', value: 'sent'}, {name: 'received', value: 'received'}],
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'direction': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter messages after this date (ISO 8601)',
            name: 'startDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'startDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter messages before this date (ISO 8601)',
            name: 'endDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'endDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of messages to return (1-100)',
            name: 'limit',
            type: 'number',
            required: false,
            default: 50,
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of messages to skip',
            name: 'offset',
            type: 'number',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'offset': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Sort order (asc or desc)',
            name: 'order',
            type: 'string',
            required: false,
            default: "desc",
            options: [{name: 'asc', value: 'asc'}, {name: 'desc', value: 'desc'}],
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'order': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Include raw platform message data',
            name: 'raw',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'raw': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Include reactions on each message',
            name: 'reactions',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['list'],
              },
            },
            routing: {
              request: {
                qs: {
                  'reactions': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['list'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['stats'],
            },
          },
        },
      {
            displayName: 'Message ID',
            name: 'messageId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['get'],
              },
            },
            routing: {
              request: {
                qs: {
                  'messageId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['get'],
            },
          },
        },
      {
          displayName: 'MessageId',
          name: 'messageId',
          type: 'string',
          required: true,
          default: '',
          description: 'messageId parameter',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['get'],
            },
          },
        },
      {
            displayName: 'Delete messages older than this many days',
            name: 'daysBefore',
            type: 'number',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['cleanup'],
              },
            },
            routing: {
              request: {
                qs: {
                  'daysBefore': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['cleanup'],
            },
          },
        },
      {
            displayName: 'Single target in format: platformId:type:id',
            name: 'target',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['send'],
              },
            },
            routing: {
              request: {
                qs: {
                  'target': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Multiple targets comma-separated: platformId:type:id,platformId:type:id',
            name: 'targets',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['send'],
              },
            },
            routing: {
              request: {
                qs: {
                  'targets': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Message text content',
            name: 'text',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['send'],
              },
            },
            routing: {
              request: {
                qs: {
                  'text': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Full message content object (advanced)',
            name: 'content',
            type: 'json',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['send'],
              },
            },
            routing: {
              request: {
                body: {
                  'content': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Message options',
            name: 'options',
            type: 'json',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['send'],
              },
            },
            routing: {
              request: {
                body: {
                  'options': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Message metadata',
            name: 'metadata',
            type: 'json',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['send'],
              },
            },
            routing: {
              request: {
                body: {
                  'metadata': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['send'],
            },
          },
        },
      {
            displayName: 'Message job ID',
            name: 'jobId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['status'],
              },
            },
            routing: {
              request: {
                qs: {
                  'jobId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['status'],
            },
          },
        },
      {
          displayName: 'JobId',
          name: 'jobId',
          type: 'string',
          required: true,
          default: '',
          description: 'jobId parameter',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['status'],
            },
          },
        },
      {
            displayName: 'Failed message job ID',
            name: 'jobId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['retry'],
              },
            },
            routing: {
              request: {
                qs: {
                  'jobId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['retry'],
            },
          },
        },
      {
          displayName: 'JobId',
          name: 'jobId',
          type: 'string',
          required: true,
          default: '',
          description: 'jobId parameter',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['retry'],
            },
          },
        },
      {
            displayName: 'Platform configuration ID',
            name: 'platformId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['react'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Message ID to react to',
            name: 'messageId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['react'],
              },
            },
            routing: {
              request: {
                qs: {
                  'messageId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Emoji to react with (e.g., "👍", "❤️")',
            name: 'emoji',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['react'],
              },
            },
            routing: {
              request: {
                qs: {
                  'emoji': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['react'],
            },
          },
        },
      {
            displayName: 'Platform configuration ID',
            name: 'platformId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['unreact'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platformId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Message ID to unreact from',
            name: 'messageId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['unreact'],
              },
            },
            routing: {
              request: {
                qs: {
                  'messageId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Emoji to remove (e.g., "👍", "❤️")',
            name: 'emoji',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['messages'],
                operation: ['unreact'],
              },
            },
            routing: {
              request: {
                qs: {
                  'emoji': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['messages'],
              operation: ['unreact'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['platform logs'],
          },
        },
        options: [
          {
          name: 'Logs',
          value: 'logs',
          action: 'List platform processing logs for a project',
          description: 'List platform processing logs for a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/logs',
              
            },
          },
        },
          {
          name: 'Logs',
          value: 'logs',
          action: 'List logs for a specific platform configuration',
          description: 'List logs for a specific platform configuration',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/{{ $parameter["platformId"] }}/logs',
              
            },
          },
        },
          {
          name: 'Logs',
          value: 'logs',
          action: 'Get platform logs statistics and recent errors',
          description: 'Get platform logs statistics and recent errors',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/logs/stats',
              
            },
          },
        }
        ],
        default: 'logs',
      },
      {
            displayName: 'Filter by platform (telegram, discord)',
            name: 'platform',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platform': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by log level',
            name: 'level',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'info', value: 'info'}, {name: 'warn', value: 'warn'}, {name: 'error', value: 'error'}, {name: 'debug', value: 'debug'}],
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'level': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by log category',
            name: 'category',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'connection', value: 'connection'}, {name: 'webhook', value: 'webhook'}, {name: 'message', value: 'message'}, {name: 'error', value: 'error'}, {name: 'auth', value: 'auth'}, {name: 'general', value: 'general'}],
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'category': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter logs after this date (ISO 8601)',
            name: 'startDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'startDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter logs before this date (ISO 8601)',
            name: 'endDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'endDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of logs to return (1-1000)',
            name: 'limit',
            type: 'number',
            required: false,
            default: "100",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of logs to skip',
            name: 'offset',
            type: 'number',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'offset': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platform logs'],
              operation: ['logs'],
            },
          },
        },
      {
            displayName: 'Filter by log level',
            name: 'level',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'info', value: 'info'}, {name: 'warn', value: 'warn'}, {name: 'error', value: 'error'}, {name: 'debug', value: 'debug'}],
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'level': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by log category',
            name: 'category',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'connection', value: 'connection'}, {name: 'webhook', value: 'webhook'}, {name: 'message', value: 'message'}, {name: 'error', value: 'error'}, {name: 'auth', value: 'auth'}, {name: 'general', value: 'general'}],
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'category': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter logs after this date (ISO 8601)',
            name: 'startDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'startDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter logs before this date (ISO 8601)',
            name: 'endDate',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'endDate': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of logs to return (1-1000)',
            name: 'limit',
            type: 'number',
            required: false,
            default: "100",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of logs to skip',
            name: 'offset',
            type: 'number',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platform logs'],
                operation: ['logs'],
              },
            },
            routing: {
              request: {
                qs: {
                  'offset': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platform logs'],
              operation: ['logs'],
            },
          },
        },
      {
          displayName: 'PlatformId',
          name: 'platformId',
          type: 'string',
          required: true,
          default: '',
          description: 'platformId parameter',
          displayOptions: {
            show: {
              resource: ['platform logs'],
              operation: ['logs'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platform logs'],
              operation: ['logs'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['platforms'],
          },
        },
        options: [
          {
          name: 'Create',
          value: 'create',
          action: 'Configure a new platform integration',
          description: 'Configure a new platform integration',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms',
              body: {},
            },
          },
        },
          {
          name: 'List',
          value: 'list',
          action: 'List configured platforms for project',
          description: 'List configured platforms for project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms',
              
            },
          },
        },
          {
          name: 'Get',
          value: 'get',
          action: 'Get platform configuration details',
          description: 'Get platform configuration details',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/{{ $parameter["id"] }}',
              
            },
          },
        },
          {
          name: 'Update',
          value: 'update',
          action: 'Update platform configuration',
          description: 'Update platform configuration',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/{{ $parameter["id"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Delete',
          value: 'delete',
          action: 'Remove platform configuration',
          description: 'Remove platform configuration',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/{{ $parameter["id"] }}',
              
            },
          },
        },
          {
          name: 'Register-webhook',
          value: 'register-webhook',
          action: 'Register webhook URL with platform provider',
          description: 'Register webhook URL with platform provider',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/{{ $parameter["id"] }}/register-webhook',
              
            },
          },
        },
          {
          name: 'Qr-code',
          value: 'qr-code',
          action: 'Get QR code for WhatsApp authentication',
          description: 'Get QR code for WhatsApp authentication',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/platforms/{{ $parameter["id"] }}/qr-code',
              
            },
          },
        },
          {
          name: 'Supported',
          value: 'supported',
          action: 'List supported platforms with credential requirements',
          description: 'List supported platforms with credential requirements',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/platforms/supported',
              
            },
          },
        }
        ],
        default: 'create',
      },
      {
            displayName: 'Platform type',
            name: 'platform',
            type: 'string',
            required: true,
            default: "",
            options: [{name: 'discord', value: 'discord'}, {name: 'telegram', value: 'telegram'}, {name: 'whatsapp-evo', value: 'whatsapp-evo'}],
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'platform': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Friendly name for the platform instance',
            name: 'name',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Optional description for the platform instance',
            name: 'description',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'description': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Platform credentials (JSON object). Use "msgcore platforms supported" to see required fields for each platform.',
            name: 'credentials',
            type: 'json',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                body: {
                  'credentials': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Enable platform',
            name: 'isActive',
            type: 'boolean',
            required: false,
            default: true,
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'isActive': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Enable test mode',
            name: 'testMode',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'testMode': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['create'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['list'],
            },
          },
        },
      {
            displayName: 'Platform ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['get'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['get'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['get'],
            },
          },
        },
      {
            displayName: 'Updated friendly name',
            name: 'name',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Updated description',
            name: 'description',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'description': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Updated credentials (JSON object)',
            name: 'credentials',
            type: 'json',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                body: {
                  'credentials': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Enable/disable platform',
            name: 'isActive',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'isActive': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Enable/disable test mode',
            name: 'testMode',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'testMode': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['update'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['update'],
            },
          },
        },
      {
            displayName: 'Platform ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['delete'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['delete'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['delete'],
            },
          },
        },
      {
            displayName: 'Platform ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['register-webhook'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['register-webhook'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['register-webhook'],
            },
          },
        },
      {
            displayName: 'WhatsApp Platform ID',
            name: 'id',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['platforms'],
                operation: ['qr-code'],
              },
            },
            routing: {
              request: {
                qs: {
                  'id': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['qr-code'],
            },
          },
        },
      {
          displayName: 'Id',
          name: 'id',
          type: 'string',
          required: true,
          default: '',
          description: 'id parameter',
          displayOptions: {
            show: {
              resource: ['platforms'],
              operation: ['qr-code'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['projects'],
          },
        },
        options: [
          {
          name: 'Create',
          value: 'create',
          action: 'Create a new project',
          description: 'Create a new project',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects',
              body: {},
            },
          },
        },
          {
          name: 'List',
          value: 'list',
          action: 'List all projects',
          description: 'List all projects',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects',
              
            },
          },
        },
          {
          name: 'Get',
          value: 'get',
          action: 'Get project details',
          description: 'Get project details',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}',
              
            },
          },
        },
          {
          name: 'Update',
          value: 'update',
          action: 'Update project name, description and settings',
          description: 'Update project name, description and settings',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Delete',
          value: 'delete',
          action: 'Delete a project',
          description: 'Delete a project',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}',
              
            },
          },
        }
        ],
        default: 'create',
      },
      {
            displayName: 'Project name',
            name: 'name',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['projects'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Project description',
            name: 'description',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['projects'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'description': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Project environment',
            name: 'environment',
            type: 'string',
            required: false,
            default: "development",
            options: [{name: 'development', value: 'development'}, {name: 'staging', value: 'staging'}, {name: 'production', value: 'production'}],
            displayOptions: {
              show: {
                resource: ['projects'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'environment': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['projects'],
              operation: ['get'],
            },
          },
        },
      {
            displayName: 'Project name',
            name: 'name',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['projects'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Project description',
            name: 'description',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['projects'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'description': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Project environment',
            name: 'environment',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'development', value: 'development'}, {name: 'staging', value: 'staging'}, {name: 'production', value: 'production'}],
            displayOptions: {
              show: {
                resource: ['projects'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'environment': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Set as default project',
            name: 'isDefault',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['projects'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'isDefault': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['projects'],
              operation: ['update'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['projects'],
              operation: ['delete'],
            },
          },
        },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['webhooks'],
          },
        },
        options: [
          {
          name: 'Create',
          value: 'create',
          action: 'Create a new webhook for event notifications',
          description: 'Create a new webhook for event notifications',
          routing: {
            request: {
              method: 'POST',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/webhooks',
              body: {},
            },
          },
        },
          {
          name: 'List',
          value: 'list',
          action: 'List all webhooks for a project',
          description: 'List all webhooks for a project',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/webhooks',
              
            },
          },
        },
          {
          name: 'Get',
          value: 'get',
          action: 'Get a specific webhook with delivery statistics',
          description: 'Get a specific webhook with delivery statistics',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/webhooks/{{ $parameter["webhookId"] }}',
              
            },
          },
        },
          {
          name: 'Update',
          value: 'update',
          action: 'Update a webhook configuration',
          description: 'Update a webhook configuration',
          routing: {
            request: {
              method: 'PATCH',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/webhooks/{{ $parameter["webhookId"] }}',
              body: {},
            },
          },
        },
          {
          name: 'Delete',
          value: 'delete',
          action: 'Delete a webhook',
          description: 'Delete a webhook',
          routing: {
            request: {
              method: 'DELETE',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/webhooks/{{ $parameter["webhookId"] }}',
              
            },
          },
        },
          {
          name: 'Deliveries',
          value: 'deliveries',
          action: 'List webhook delivery attempts with filtering',
          description: 'List webhook delivery attempts with filtering',
          routing: {
            request: {
              method: 'GET',
              url: '=/api/v1/projects/{{ $parameter["project"] }}/webhooks/{{ $parameter["webhookId"] }}/deliveries',
              
            },
          },
        }
        ],
        default: 'create',
      },
      {
            displayName: 'Friendly name for the webhook',
            name: 'name',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Target URL for webhook delivery',
            name: 'url',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'url': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Events to subscribe to (comma-separated: message.received,message.sent,message.failed,button.clicked,reaction.added,reaction.removed)',
            name: 'events',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'events': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Custom webhook secret (auto-generated if not provided)',
            name: 'secret',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['create'],
              },
            },
            routing: {
              request: {
                qs: {
                  'secret': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['create'],
            },
          },
        },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['list'],
            },
          },
        },
      {
            displayName: 'Webhook ID',
            name: 'webhookId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['get'],
              },
            },
            routing: {
              request: {
                qs: {
                  'webhookId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['get'],
            },
          },
        },
      {
          displayName: 'WebhookId',
          name: 'webhookId',
          type: 'string',
          required: true,
          default: '',
          description: 'webhookId parameter',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['get'],
            },
          },
        },
      {
            displayName: 'Webhook ID',
            name: 'webhookId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'webhookId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'New webhook name',
            name: 'name',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'name': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'New webhook URL',
            name: 'url',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'url': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'New events subscription',
            name: 'events',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'events': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Enable or disable webhook',
            name: 'isActive',
            type: 'boolean',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['update'],
              },
            },
            routing: {
              request: {
                qs: {
                  'isActive': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['update'],
            },
          },
        },
      {
          displayName: 'WebhookId',
          name: 'webhookId',
          type: 'string',
          required: true,
          default: '',
          description: 'webhookId parameter',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['update'],
            },
          },
        },
      {
            displayName: 'Webhook ID',
            name: 'webhookId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['delete'],
              },
            },
            routing: {
              request: {
                qs: {
                  'webhookId': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['delete'],
            },
          },
        },
      {
          displayName: 'WebhookId',
          name: 'webhookId',
          type: 'string',
          required: true,
          default: '',
          description: 'webhookId parameter',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['delete'],
            },
          },
        },
      {
            displayName: 'Webhook ID',
            name: 'webhookId',
            type: 'string',
            required: true,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['deliveries'],
              },
            },
            routing: {
              request: {
                qs: {
                  'webhookId': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by event type',
            name: 'event',
            type: 'string',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['deliveries'],
              },
            },
            routing: {
              request: {
                qs: {
                  'event': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Filter by delivery status',
            name: 'status',
            type: 'string',
            required: false,
            default: "",
            options: [{name: 'pending', value: 'pending'}, {name: 'success', value: 'success'}, {name: 'failed', value: 'failed'}],
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['deliveries'],
              },
            },
            routing: {
              request: {
                qs: {
                  'status': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of deliveries to return (1-100)',
            name: 'limit',
            type: 'number',
            required: false,
            default: 50,
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['deliveries'],
              },
            },
            routing: {
              request: {
                qs: {
                  'limit': '={{$value}}',
                },
              },
            },
          },
      {
            displayName: 'Number of deliveries to skip',
            name: 'offset',
            type: 'number',
            required: false,
            default: "",
            
            displayOptions: {
              show: {
                resource: ['webhooks'],
                operation: ['deliveries'],
              },
            },
            routing: {
              request: {
                qs: {
                  'offset': '={{$value}}',
                },
              },
            },
          },
      {
          displayName: 'Project',
          name: 'project',
          type: 'string',
          required: true,
          default: 'default',
          description: 'Project identifier to operate on',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['deliveries'],
            },
          },
        },
      {
          displayName: 'WebhookId',
          name: 'webhookId',
          type: 'string',
          required: true,
          default: '',
          description: 'webhookId parameter',
          displayOptions: {
            show: {
              resource: ['webhooks'],
              operation: ['deliveries'],
            },
          },
        }
    ],
  };
}
