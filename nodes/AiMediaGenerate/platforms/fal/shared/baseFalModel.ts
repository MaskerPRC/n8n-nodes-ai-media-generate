import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BaseModel, type ModelConfig } from '../../../shared/baseModel';

export abstract class BaseFalModel extends BaseModel {
	protected apiKey: string | null = null;
	protected asyncBaseUrl = 'https://queue.fal.run';
	protected syncBaseUrl = 'https://fal.run';

	constructor(executeFunctions: IExecuteFunctions, itemIndex: number) {
		super(executeFunctions, itemIndex, 'fal');
		// 不在构造函数中获取 credentials，延迟到第一次使用时获取
	}

	protected async ensureApiKey(): Promise<void> {
		if (this.apiKey !== null) {
			return; // 已经获取过了
		}

		const credentials = await this.getCredentialsAsync();
		
		// 检查 credentials 是否存在
		if (!credentials) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'FAL API credentials not found. Please select the FAL API credential in the node settings.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 检查 credentials 类型
		if (typeof credentials !== 'object') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Invalid FAL API credentials format. Expected object, got ${typeof credentials}.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 检查 credentials 对象是否为空
		const credentialKeys = Object.keys(credentials);
		if (credentialKeys.length === 0) {
			const credentialsDebug = `\n\nCredentials Debug Info:\nCredentials object: ${JSON.stringify(credentials, null, 2)}\nCredential keys: ${credentialKeys.join(', ') || '(none)'}\nCredentials type: ${typeof credentials}`;
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`FAL API credentials are empty. The credential was selected but contains no data.${credentialsDebug}\n\nPlease: 1) Go to Credentials page, 2) Edit your FAL API credential, 3) Re-enter your API Key, 4) Click "Test" to verify, 5) Click "Save", 6) Go back to the node and re-select the credential.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 获取 API Key
		const apiKey = credentials.apiKey;
		if (!apiKey) {
			const availableKeys = credentialKeys.length > 0 ? credentialKeys.join(', ') : 'none';
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`FAL API Key is required. Found keys in credentials: ${availableKeys}. Expected 'apiKey'. Please check your credential configuration and ensure the API Key field is saved.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 验证 API Key 类型
		if (typeof apiKey !== 'string' && typeof apiKey !== 'number') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Invalid FAL API Key type. Expected string or number, got ${typeof apiKey}.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 验证 API Key 不为空
		const apiKeyString = String(apiKey).trim();
		if (apiKeyString === '') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'FAL API Key is empty. Please enter a valid API key in your credential configuration.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		this.apiKey = apiKeyString;
	}

	getCredentials(): IDataObject | Promise<IDataObject> {
		// 返回 getCredentials 的原始结果，可能是 Promise 或对象
		return this.executeFunctions.getCredentials('falApi') as IDataObject | Promise<IDataObject>;
	}

	protected async getCredentialsAsync(): Promise<IDataObject> {
		// 在 n8n 中，getCredentials 可能返回 Promise 或直接返回对象
		// 使用 await 来处理两种情况
		const credentialsResult = this.executeFunctions.getCredentials('falApi');
		
		// 如果已经是 Promise，直接 await
		// 如果不是 Promise，await 会直接返回原值
		const credentials = await Promise.resolve(credentialsResult) as IDataObject;
		
		if (!credentials || typeof credentials !== 'object') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'FAL API credentials not found. Please select the FAL API credential in the node settings.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		return credentials;
	}

	getAsyncBaseUrl(): string {
		return this.asyncBaseUrl;
	}

	getSyncBaseUrl(): string {
		return this.syncBaseUrl;
	}

	abstract getConfig(): ModelConfig;
	abstract buildRequestParams(): Promise<IDataObject>;
	protected abstract processSyncResponse(response: IDataObject): IDataObject;
	protected abstract processAsyncResponse(response: IDataObject): IDataObject;

	async makeRequest(
		method: 'GET' | 'POST',
		url: string,
		body?: IDataObject,
		timeout?: number,
	): Promise<IDataObject> {
		// 确保 API Key 已获取
		await this.ensureApiKey();
		
		const options: IHttpRequestOptions = {
			method,
			url,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Key ${this.apiKey}`,
			},
			body,
			json: true,
		};

		// 如果指定了超时时间，添加到选项中
		if (timeout) {
			options.timeout = timeout;
		}

		try {
			return await this.executeFunctions.helpers.httpRequest(options);
		} catch (error: unknown) {
			// 构建请求的原始数据用于调试
			const requestRaw = {
				method,
				url,
				headers: options.headers,
				body: body ? JSON.stringify(body, null, 2) : undefined,
			};
			
			const err = error as { response?: { body?: { detail?: string; message?: string }; statusCode?: number }; message?: string };
			if (err.response) {
				const errorMessage = err.response.body?.detail || err.response.body?.message || err.message || 'Unknown error';
				const requestDetails = `\n\nRequest Details:\nMethod: ${requestRaw.method}\nURL: ${requestRaw.url}\nHeaders: ${JSON.stringify(requestRaw.headers, null, 2)}\n${requestRaw.body ? `Body: ${requestRaw.body}` : 'Body: (empty)'}\n\nResponse Status: ${err.response.statusCode}`;
				throw new NodeOperationError(
					this.executeFunctions.getNode(),
					`API request failed: ${errorMessage}${requestDetails}`,
					{
						itemIndex: this.itemIndex,
						description: `URL: ${url}, Status: ${err.response.statusCode}`,
					},
				);
			}
			
			// 如果没有 response，也显示请求信息
			const requestDetails = `\n\nRequest Details:\nMethod: ${requestRaw.method}\nURL: ${requestRaw.url}\nHeaders: ${JSON.stringify(requestRaw.headers, null, 2)}\n${requestRaw.body ? `Body: ${requestRaw.body}` : 'Body: (empty)'}`;
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`API request failed: ${err.message || 'Unknown error'}${requestDetails}`,
				{
					itemIndex: this.itemIndex,
					description: `URL: ${url}`,
				},
			);
		}
	}
}

