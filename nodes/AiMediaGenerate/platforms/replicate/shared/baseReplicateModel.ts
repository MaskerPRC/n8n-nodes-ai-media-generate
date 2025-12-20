import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BaseModel, type ModelConfig } from '../../../shared/baseModel';

export abstract class BaseReplicateModel extends BaseModel {
	protected apiToken: string | null = null;
	protected baseUrl = 'https://api.replicate.com';

	constructor(executeFunctions: IExecuteFunctions, itemIndex: number) {
		super(executeFunctions, itemIndex, 'replicate');
	}

	protected async ensureApiToken(): Promise<void> {
		if (this.apiToken !== null) {
			return; // 已经获取过了
		}

		const credentials = await this.getCredentialsAsync();
		
		// 检查 credentials 是否存在
		if (!credentials) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Replicate API credentials not found. Please select the Replicate API credential in the node settings.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 检查 credentials 类型
		if (typeof credentials !== 'object') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Invalid Replicate API credentials format. Expected object, got ${typeof credentials}.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 检查 credentials 对象是否为空
		const credentialKeys = Object.keys(credentials);
		if (credentialKeys.length === 0) {
			const credentialsDebug = `\n\nCredentials Debug Info:\nCredentials object: ${JSON.stringify(credentials, null, 2)}\nCredential keys: ${credentialKeys.join(', ') || '(none)'}\nCredentials type: ${typeof credentials}`;
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Replicate API credentials are empty. The credential was selected but contains no data.${credentialsDebug}\n\nPlease: 1) Go to Credentials page, 2) Edit your Replicate API credential, 3) Re-enter your API Token, 4) Click "Test" to verify, 5) Click "Save", 6) Go back to the node and re-select the credential.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 获取 API Token
		const apiToken = credentials.apiToken;
		if (!apiToken) {
			const availableKeys = credentialKeys.length > 0 ? credentialKeys.join(', ') : 'none';
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Replicate API Token is required. Found keys in credentials: ${availableKeys}. Expected 'apiToken'. Please check your credential configuration and ensure the API Token field is saved.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 验证 API Token 类型
		if (typeof apiToken !== 'string' && typeof apiToken !== 'number') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Invalid Replicate API Token type. Expected string or number, got ${typeof apiToken}.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 验证 API Token 不为空
		const apiTokenString = String(apiToken).trim();
		if (apiTokenString === '') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Replicate API Token is empty. Please enter a valid API token in your credential configuration.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		this.apiToken = apiTokenString;
	}

	getCredentials(): IDataObject | Promise<IDataObject> {
		return this.executeFunctions.getCredentials('replicateApi') as IDataObject | Promise<IDataObject>;
	}

	protected async getCredentialsAsync(): Promise<IDataObject> {
		const credentialsResult = this.executeFunctions.getCredentials('replicateApi');
		const credentials = await Promise.resolve(credentialsResult) as IDataObject;
		
		if (!credentials || typeof credentials !== 'object') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Replicate API credentials not found. Please select the Replicate API credential in the node settings.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		return credentials;
	}

	getAsyncBaseUrl(): string {
		return this.baseUrl;
	}

	getSyncBaseUrl(): string {
		return this.baseUrl;
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
		// 确保 API Token 已获取
		await this.ensureApiToken();
		
		const options: IHttpRequestOptions = {
			method,
			url,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiToken}`,
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

	// 重写 executeSync 方法以适配 Replicate 的 API 格式
	async executeSync(): Promise<INodeExecutionData> {
		const config = this.getConfig();
		if (!config.supportsSync) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Model ${config.displayName} does not support synchronous requests`,
				{ itemIndex: this.itemIndex },
			);
		}

		// 确保 credentials 已加载
		await this.ensureApiToken();

		// 构建请求参数
		const params = await this.buildRequestParams();
		
		// Replicate 同步请求：POST /v1/predictions with Prefer: wait header
		const syncUrl = `${this.getSyncBaseUrl()}${config.endpoint}`;
		
		const options: IHttpRequestOptions = {
			method: 'POST',
			url: syncUrl,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiToken}`,
				Prefer: 'wait', // 等待模型完成，最多等待 60 秒
			},
			body: params,
			json: true,
			timeout: 60000, // 60 秒超时
		};

		try {
			const response = await this.executeFunctions.helpers.httpRequest(options);
			return {
				json: this.processSyncResponse(response as IDataObject),
				pairedItem: { item: this.itemIndex },
			};
		} catch (error: unknown) {
			const err = error as { response?: { body?: { detail?: string; message?: string }; statusCode?: number }; message?: string };
			if (err.response) {
				const errorMessage = err.response.body?.detail || err.response.body?.message || err.message || 'Unknown error';
				throw new NodeOperationError(
					this.executeFunctions.getNode(),
					`Synchronous request failed: ${errorMessage}`,
					{
						itemIndex: this.itemIndex,
						description: `URL: ${syncUrl}, Status: ${err.response.statusCode}`,
					},
				);
			}
			throw error;
		}
	}

	// 重写 executeAsync 方法以适配 Replicate 的 API 格式
	async executeAsync(): Promise<INodeExecutionData> {
		const config = this.getConfig();
		if (!config.supportsAsync) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Model ${config.displayName} does not support asynchronous requests`,
				{ itemIndex: this.itemIndex },
			);
		}

		// 确保 credentials 已加载
		await this.ensureApiToken();

		// 构建请求参数
		const params = await this.buildRequestParams();
		
		// Replicate 异步请求：POST /v1/predictions
		const asyncUrl = `${this.getAsyncBaseUrl()}${config.endpoint}`;
		
		const submitResponse = await this.makeRequest('POST', asyncUrl, params);

		// 获取 prediction ID
		const predictionId = submitResponse.id as string;
		if (!predictionId) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Failed to get prediction ID from async submission. Response: ${JSON.stringify(submitResponse)}`,
				{ itemIndex: this.itemIndex },
			);
		}

		// 轮询状态
		const pollInterval = 2000; // 每2秒轮询一次

		while (true) {
			// Replicate API 的状态检查端点格式：/v1/predictions/{prediction_id}
			const statusUrl = `${this.getAsyncBaseUrl()}/v1/predictions/${predictionId}`;
			const statusResponse = await this.makeRequest('GET', statusUrl);

			// 检查状态
			const status = statusResponse.status as string;
			
			if (status === 'succeeded') {
				return {
					json: this.processAsyncResponse(statusResponse as IDataObject),
					pairedItem: { item: this.itemIndex },
				};
			}

			if (status === 'failed' || status === 'canceled') {
				const errorMessage = (statusResponse.error as string) || 'Unknown error';
				throw new NodeOperationError(
					this.executeFunctions.getNode(),
					`Async request ${status}: ${errorMessage}`,
					{ itemIndex: this.itemIndex },
				);
			}

			// 如果状态是 starting 或 processing，继续轮询
			// 等待后继续轮询
			const delay = (ms: number) => {
				const start = Date.now();
				while (Date.now() - start < ms) {
					// Busy wait - acceptable for short polling intervals
				}
			};
			delay(pollInterval);
		}
	}
}

