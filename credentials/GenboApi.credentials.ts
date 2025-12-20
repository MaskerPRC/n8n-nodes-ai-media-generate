import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class GenboApi implements ICredentialType {
	name = 'genboApi';

	displayName = 'Genbo API';

	icon: Icon = { light: 'file:../nodes/AiMediaGenerate/genbo.svg', dark: 'file:../nodes/AiMediaGenerate/genbo.dark.svg' };

	documentationUrl = 'https://genbo.ai';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Genbo API Key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.genbo.ai',
			url: '/v1/images/generations',
			method: 'GET',
			qs: {
				pageNum: 1,
				pageSize: 1,
			},
		},
	};
}

