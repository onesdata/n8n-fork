import { NodeConnectionType, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { bucketFields, bucketOperations } from './BucketDescription';
import { objectFields, objectOperations } from './ObjectDescription';

export class GoogleCloudStorage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google Cloud Storage',
		name: 'googleCloudStorage',
		icon: 'file:googleCloudStorage.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Use the Google Cloud Storage API',
		defaults: {
			name: 'Google Cloud Storage',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'googleApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['serviceAccount'],
					},
				},
			}
		],
		requestDefaults: {
			returnFullResponse: true,
			baseURL: 'https://storage.googleapis.com/storage/v1',
		},
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'OAuth2',
						value: 'googleCloudStorageOAuth2Api',
					},
					{
						name: 'Service Account (recommended)',
						value: 'serviceAccount',
					},
				],
				default: 'serviceAccount',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bucket',
						value: 'bucket',
					},
					{
						name: 'Object',
						value: 'object',
					},
				],
				default: 'bucket',
			},

			// BUCKET
			...bucketOperations,
			...bucketFields,

			// OBJECT
			...objectOperations,
			...objectFields,
		],
	};
}
