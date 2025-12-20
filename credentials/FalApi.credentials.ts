import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class FalApi implements ICredentialType {
	name = 'falApi';

	displayName = 'FAL API';

	icon: Icon = { light: 'file:../nodes/AiMediaGenerate/fal.svg', dark: 'file:../nodes/AiMediaGenerate/fal.dark.svg' };

	documentationUrl = 'https://fal.ai/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your FAL API Key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Key {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.fal.ai',
			url: '/v1/models',
			method: 'GET',
			qs: {
				limit: 1,
			},
		},
	};
}

