import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BaseModel, type ModelConfig } from '../../../shared/baseModel';

export abstract class BaseGenboModel extends BaseModel {
	protected apiKey: string | null = null;
	protected baseUrl = 'https://api.genbo.ai';

	constructor(executeFunctions: IExecuteFunctions, itemIndex: number) {
		super(executeFunctions, itemIndex, 'genbo');
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
				'Genbo API credentials not found. Please select the Genbo API credential in the node settings.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 检查 credentials 类型
		if (typeof credentials !== 'object') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Invalid Genbo API credentials format. Expected object, got ${typeof credentials}.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 检查 credentials 对象是否为空
		const credentialKeys = Object.keys(credentials);
		if (credentialKeys.length === 0) {
			const credentialsDebug = `\n\nCredentials Debug Info:\nCredentials object: ${JSON.stringify(credentials, null, 2)}\nCredential keys: ${credentialKeys.join(', ') || '(none)'}\nCredentials type: ${typeof credentials}`;
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Genbo API credentials are empty. The credential was selected but contains no data.${credentialsDebug}\n\nPlease: 1) Go to Credentials page, 2) Edit your Genbo API credential, 3) Re-enter your API Key, 4) Click "Test" to verify, 5) Click "Save", 6) Go back to the node and re-select the credential.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 获取 API Key
		const apiKey = credentials.apiKey;
		if (!apiKey) {
			const availableKeys = credentialKeys.length > 0 ? credentialKeys.join(', ') : 'none';
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Genbo API Key is required. Found keys in credentials: ${availableKeys}. Expected 'apiKey'. Please check your credential configuration and ensure the API Key field is saved.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 验证 API Key 类型
		if (typeof apiKey !== 'string' && typeof apiKey !== 'number') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Invalid Genbo API Key type. Expected string or number, got ${typeof apiKey}.`,
				{ itemIndex: this.itemIndex },
			);
		}
		
		// 验证 API Key 不为空
		const apiKeyString = String(apiKey).trim();
		if (apiKeyString === '') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Genbo API Key is empty. Please enter a valid API key in your credential configuration.',
				{ itemIndex: this.itemIndex },
			);
		}
		
		this.apiKey = apiKeyString;
	}

	getCredentials(): IDataObject | Promise<IDataObject> {
		return this.executeFunctions.getCredentials('genboApi') as IDataObject | Promise<IDataObject>;
	}

	protected async getCredentialsAsync(): Promise<IDataObject> {
		const credentialsResult = this.executeFunctions.getCredentials('genboApi');
		const credentials = await Promise.resolve(credentialsResult) as IDataObject;
		
		if (!credentials || typeof credentials !== 'object') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Genbo API credentials not found. Please select the Genbo API credential in the node settings.',
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
		// 确保 API Key 已获取
		await this.ensureApiKey();
		
		const options: IHttpRequestOptions = {
			method,
			url,
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
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

	// 重写 executeAsync 方法以适配 genbo.ai 的 API 格式
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
		await this.ensureApiKey();

		// 提交异步请求
		const params = await this.buildRequestParams();
		const asyncUrl = `${this.getAsyncBaseUrl()}${config.endpoint}`;
		const submitResponse = await this.makeRequest('POST', asyncUrl, params);

		// 处理响应可能被包装在 data 字段中的情况
		const responseData = (submitResponse.data || submitResponse) as IDataObject;
		const taskId = (responseData.task_id || submitResponse.task_id) as string;
		if (!taskId) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Failed to get task_id from async submission. Response: ${JSON.stringify(submitResponse)}`,
				{ itemIndex: this.itemIndex },
			);
		}

		// 轮询状态
		const pollInterval = 2000; // 每2秒轮询一次

		while (true) {
			// Genbo API 的状态检查端点格式：/v1/images/generations/:task_id
			const statusUrl = `${this.getAsyncBaseUrl()}${config.endpoint}/${taskId}`;
			const statusResponseRaw = await this.makeRequest('GET', statusUrl);

			// 处理响应可能被包装在 data 字段中的情况
			const statusResponse = (statusResponseRaw.data || statusResponseRaw) as IDataObject;

			// 首先检查响应中是否已经包含结果数据（即使状态不是 SUCCESS）
			// 如果已经有结果数据，说明任务已完成，直接返回
			let hasResult = false;
			
			// 检查 task_result 对象
			if (statusResponse.task_result) {
				const taskResult = statusResponse.task_result as IDataObject;
				// 如果 task_result 是对象且包含 url 字段（数组或字符串）
				if (typeof taskResult === 'object' && (taskResult.url || taskResult.urls || taskResult.image_url || taskResult.image_urls)) {
					hasResult = true;
				}
			}
			
			// 检查其他可能的结果字段
			if (!hasResult) {
				hasResult = !!(statusResponse.result || 
					(Array.isArray(statusResponse.images) && statusResponse.images.length > 0) ||
					(Array.isArray(statusResponse.urls) && statusResponse.urls.length > 0) ||
					(Array.isArray(statusResponse.image_urls) && statusResponse.image_urls.length > 0));
			}

			if (hasResult) {
				// 如果已经有结果数据，无论状态如何都认为任务已完成
				return {
					json: this.processAsyncResponse(statusResponse as IDataObject),
					pairedItem: { item: this.itemIndex },
				};
			}

			// 尝试多个可能的状态字段名
			const taskStatus = (statusResponse.task_status || 
				statusResponse.status || 
				statusResponse.state || 
				statusResponse.taskStatus) as string | undefined;

			if (!taskStatus) {
				// 如果找不到状态字段，但也没有结果数据，继续等待
				// 等待后继续轮询
				const delay = (ms: number) => {
					const start = Date.now();
					while (Date.now() - start < ms) {
						// Busy wait - acceptable for short polling intervals
					}
				};
				delay(pollInterval);
				continue;
			}

			// 将状态值转换为大写进行比较（不区分大小写）
			const statusUpper = String(taskStatus).toUpperCase();

			// 检查成功状态（支持多种可能的成功状态值）
			const successStatuses = ['SUCCESS', 'COMPLETED', 'DONE', 'FINISHED', 'SUCCEEDED', 'OK'];
			if (successStatuses.includes(statusUpper)) {
				// 状态响应中已包含结果数据
				return {
					json: this.processAsyncResponse(statusResponse as IDataObject),
					pairedItem: { item: this.itemIndex },
				};
			}

			// 检查失败状态（支持多种可能的失败状态值）
			const failedStatuses = ['FAILED', 'ERROR', 'FAILURE', 'CANCELLED', 'ABORTED', 'REJECTED'];
			if (failedStatuses.includes(statusUpper)) {
				const failReason = (statusResponse.fail_reason || 
					statusResponse.error || 
					statusResponse.message || 
					statusResponse.reason || 
					statusResponse.error_message ||
					'Unknown error') as string;
				throw new NodeOperationError(
					this.executeFunctions.getNode(),
					`Async request failed: ${failReason}`,
					{ itemIndex: this.itemIndex },
				);
			}

			// 如果状态是进行中状态，继续轮询
			// 支持的状态值：PENDING, PROCESSING, IN_PROGRESS, RUNNING, QUEUED 等
			const inProgressStatuses = [
				'PENDING', 
				'PROCESSING', 
				'IN_PROGRESS', 
				'IN PROGRESS',
				'RUNNING', 
				'QUEUED',
				'QUEUE',
				'WAITING',
				'STARTED',
				'ACTIVE',
			];
			if (inProgressStatuses.includes(statusUpper)) {
				// 等待后继续轮询
				const delay = (ms: number) => {
					const start = Date.now();
					while (Date.now() - start < ms) {
						// Busy wait - acceptable for short polling intervals
					}
				};
				delay(pollInterval);
				continue;
			}

			// 如果状态值不在预期范围内，但也没有结果数据，继续等待
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

