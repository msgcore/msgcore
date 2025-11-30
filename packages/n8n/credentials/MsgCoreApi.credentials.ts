import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class MsgCoreApi implements ICredentialType {
  name = 'MsgCoreApi';
  displayName = 'MsgCore API';
  documentationUrl = 'https://docs.msgcore.dev/authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: 'https://api.msgcore.dev',
      description: 'MsgCore API base URL',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'MsgCore API key from your project dashboard',
    },
  ];

  authenticate = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  } as IAuthenticateGeneric;
}
