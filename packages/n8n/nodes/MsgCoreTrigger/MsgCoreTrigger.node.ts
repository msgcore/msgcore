import {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

export class MsgCoreTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MsgCore Trigger',
    name: 'msgCoreTrigger',
    icon: 'file:msgcore.svg',
    group: ['trigger'],
    version: 1,
    description: 'Triggers workflow when messages are received via MsgCore',
    defaults: {
      name: 'MsgCore Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'MsgCoreApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Project ID',
        name: 'projectId',
        type: 'string',
        default: 'default',
        required: true,
        description: 'The MsgCore project ID to monitor for messages',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          {
            name: 'Message Received',
            value: 'message.received',
            description: 'Trigger when a message is received',
          },
          {
            name: 'Message Sent',
            value: 'message.sent',
            description: 'Trigger when a message is sent successfully',
          },
          {
            name: 'Message Failed',
            value: 'message.failed',
            description: 'Trigger when a message fails to send',
          },
          {
            name: 'Button Clicked',
            value: 'button.clicked',
            description: 'Trigger when a button is clicked',
          },
          {
            name: 'Reaction Added',
            value: 'reaction.added',
            description: 'Trigger when a reaction is added to a message',
          },
          {
            name: 'Reaction Removed',
            value: 'reaction.removed',
            description: 'Trigger when a reaction is removed from a message',
          },
        ],
        default: ['message.received'],
        required: true,
        description: 'The events to subscribe to',
      },
      {
        displayName: 'Webhook Name',
        name: 'webhookName',
        type: 'string',
        default: 'n8n Webhook',
        description: 'Name to identify this webhook in MsgCore dashboard',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const credentials = await this.getCredentials('MsgCoreApi');

        if (webhookData.webhookId === undefined) {
          return false;
        }

        const projectId = this.getNodeParameter('projectId') as string;
        if (!projectId) {
          throw new Error('Project ID is required');
        }

        const apiUrl = credentials.apiUrl as string;

        try {
          const response = await this.helpers.request({
            method: 'GET',
            url: `${apiUrl}/api/v1/projects/${projectId}/webhooks/${webhookData.webhookId}`,
            headers: {
              'X-API-Key': credentials.apiKey as string,
            },
            json: true,
          });

          return !!response;
        } catch (error: any) {
          if (error.statusCode === 404 || error.response?.status === 404) {
            delete webhookData.webhookId;
            delete webhookData.webhookSecret;
            delete webhookData.events;
            return false;
          }
          throw error;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default') as string;
        const credentials = await this.getCredentials('MsgCoreApi');
        const projectId = this.getNodeParameter('projectId') as string;
        const events = this.getNodeParameter('events', []) as string[];
        const webhookName = this.getNodeParameter('webhookName', 'n8n Webhook') as string;

        if (!projectId) {
          throw new Error('Project ID is required');
        }

        if (webhookUrl.includes('//localhost')) {
          throw new Error(
            'The Webhook cannot work on "localhost". Please setup n8n on a custom domain or start with "--tunnel"!'
          );
        }

        const apiUrl = credentials.apiUrl as string;

        try {
          const response = await this.helpers.request({
            method: 'POST',
            url: `${apiUrl}/api/v1/projects/${projectId}/webhooks`,
            headers: {
              'X-API-Key': credentials.apiKey as string,
              'Content-Type': 'application/json',
            },
            body: {
              url: webhookUrl,
              events: events,
              name: webhookName,
              // Let MsgCore auto-generate a secure secret
            },
            json: true,
          });

          if (!response || !response.id) {
            throw new Error('Invalid response from MsgCore API: missing webhook ID');
          }

          const webhookData = this.getWorkflowStaticData('node');
          webhookData.webhookId = response.id;
          webhookData.webhookSecret = response.secret; // Store secret for HMAC validation
          webhookData.events = events;

          return true;
        } catch (error: any) {
          throw new Error(`Failed to create MsgCore webhook: ${error.message || String(error)}`);
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const credentials = await this.getCredentials('MsgCoreApi');
        const projectId = this.getNodeParameter('projectId') as string;

        if (!projectId) {
          throw new Error('Project ID is required');
        }

        if (webhookData.webhookId === undefined) {
          return true;
        }

        const apiUrl = credentials.apiUrl as string;

        try {
          await this.helpers.request({
            method: 'DELETE',
            url: `${apiUrl}/api/v1/projects/${projectId}/webhooks/${webhookData.webhookId}`,
            headers: {
              'X-API-Key': credentials.apiKey as string,
            },
            json: true,
          });

          delete webhookData.webhookId;
          delete webhookData.webhookSecret;
          delete webhookData.events;

          return true;
        } catch (error: any) {
          // Webhook might already be deleted
          if (error.statusCode === 404 || error.response?.status === 404) {
            delete webhookData.webhookId;
            delete webhookData.webhookSecret;
            delete webhookData.events;
            return true;
          }
          throw error;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();
    const headers = this.getHeaderData();

    // Validate HMAC signature for security (MsgCore format: sha256=<hash>)
    const webhookData = this.getWorkflowStaticData('node');
    const signatureHeader = headers['x-msgcore-signature'] as string;
    const timestamp = headers['x-msgcore-timestamp'] as string;

    // If we have a secret stored, signature validation is required
    if (webhookData.webhookSecret) {
      if (!signatureHeader || !timestamp) {
        throw new Error('Missing webhook signature or timestamp');
      }

      const crypto = require('crypto');

      // MsgCore signature format: timestamp.body
      const signedPayload = `${timestamp}.${JSON.stringify(bodyData)}`;
      const expectedSignature = crypto
        .createHmac('sha256', webhookData.webhookSecret)
        .update(signedPayload)
        .digest('hex');

      // Extract signature (format: "sha256=<hash>")
      const signature = signatureHeader.replace('sha256=', '');

      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature - possible security attack');
      }
    }

    // Process the webhook payload from MsgCore
    // The payload structure depends on the event type
    return {
      workflowData: [this.helpers.returnJsonArray([bodyData])],
    };
  }
}
