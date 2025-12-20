import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class ReplicateApi implements ICredentialType {
	name = 'replicateApi';

	displayName = 'Replicate API';

	icon: Icon = 'file:../nodes/AiMediaGenerate/fal.svg';

	documentationUrl = 'https://replicate.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Replicate API Token. Find it in your account settings at https://replicate.com/account',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.replicate.com',
			url: '/v1/models',
			method: 'GET',
		},
	};
}

