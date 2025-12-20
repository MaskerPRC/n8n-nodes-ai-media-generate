import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export interface ModelConfig {
	name: string;
	displayName: string;
	endpoint: string;
	syncEndpoint?: string; // 同步接口端点（如果与异步不同）
	syncBaseUrl?: string; // 同步接口的 base URL
	supportsSync: boolean;
	supportsAsync: boolean;
	modelType?: 'image' | 'video' | 'audio'; // 模型类型：图片、视频或音频，用于设置不同的超时时间
}

export interface SyncRequestParams {
	[key: string]: IDataObject | string | number | boolean | undefined;
}

export interface AsyncRequestParams {
	[key: string]: IDataObject | string | number | boolean | undefined;
}

export interface SyncResponse {
	[key: string]: IDataObject | string | number | boolean | undefined;
}

export interface AsyncSubmitResponse {
	request_id: string;
	[key: string]: IDataObject | string | number | boolean | undefined;
}

export interface AsyncStatusResponse {
	status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
	[key: string]: IDataObject | string | number | boolean | undefined;
}

export interface AsyncResultResponse {
	[key: string]: IDataObject | string | number | boolean | undefined;
}

export abstract class BaseModel {
	protected executeFunctions: IExecuteFunctions;
	protected itemIndex: number;
	protected platform: string;

	constructor(executeFunctions: IExecuteFunctions, itemIndex: number, platform: string) {
		this.executeFunctions = executeFunctions;
		this.itemIndex = itemIndex;
		this.platform = platform;
	}

	abstract getConfig(): ModelConfig;
	abstract getInputSchema(): INodeProperties[];
	abstract buildRequestParams(): Promise<IDataObject>;
	abstract getCredentials(): IDataObject | Promise<IDataObject>;
	abstract getAsyncBaseUrl(): string;
	abstract getSyncBaseUrl(): string;
	abstract makeRequest(
		method: 'GET' | 'POST',
		url: string,
		body?: IDataObject,
		timeout?: number,
	): Promise<IDataObject>;

	async executeSync(): Promise<INodeExecutionData> {
		const config = this.getConfig();
		if (!config.supportsSync) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Model ${config.displayName} does not support synchronous requests`,
				{ itemIndex: this.itemIndex },
			);
		}

		// 确保 credentials 已加载（对于 FAL 平台）
		if (this.platform === 'fal' && typeof (this as unknown as { ensureApiKey?: () => Promise<void> }).ensureApiKey === 'function') {
			await (this as unknown as { ensureApiKey: () => Promise<void> }).ensureApiKey();
		}

		// 构建同步请求参数
		const params = await this.buildRequestParams();

		// 确定同步接口的 URL
		const syncBaseUrl = config.syncBaseUrl || this.getSyncBaseUrl();
		const syncEndpoint = config.syncEndpoint || config.endpoint;
		const syncUrl = `${syncBaseUrl}${syncEndpoint}`;

		// 发送同步请求
		// 根据模型类型设置超时时间：图片10分钟，视频1小时
		const modelType = config.modelType || 'image'; // 默认为图片类型
		const syncTimeout = modelType === 'video' ? 3600000 : 600000; // 视频1小时，图片10分钟
		const response = await this.makeRequest('POST', syncUrl, params, syncTimeout);

		// 处理同步响应
		return {
			json: this.processSyncResponse(response as SyncResponse),
			pairedItem: { item: this.itemIndex },
		};
	}

	async executeAsync(): Promise<INodeExecutionData> {
		const config = this.getConfig();
		if (!config.supportsAsync) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Model ${config.displayName} does not support asynchronous requests`,
				{ itemIndex: this.itemIndex },
			);
		}

		// 确保 credentials 已加载（对于 FAL 平台）
		if (this.platform === 'fal' && typeof (this as unknown as { ensureApiKey?: () => Promise<void> }).ensureApiKey === 'function') {
			await (this as unknown as { ensureApiKey: () => Promise<void> }).ensureApiKey();
		}

		// 提交异步请求
		const params = await this.buildRequestParams();
		const asyncUrl = `${this.getAsyncBaseUrl()}${config.endpoint}`;
		const submitResponse = await this.makeRequest('POST', asyncUrl, params);

		const requestId = submitResponse.request_id as string;
		if (!requestId) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Failed to get request_id from async submission',
				{ itemIndex: this.itemIndex },
			);
		}

		// 轮询状态
		const pollInterval = 2000; // 每2秒轮询一次

		while (true) {
			// FAL API 的状态检查端点格式：/endpoint/requests/{requestId}/status
			const statusUrl = `${this.getAsyncBaseUrl()}${config.endpoint}/requests/${requestId}/status`;
			const statusResponse = await this.makeRequest('GET', statusUrl);

			if (statusResponse.status === 'COMPLETED') {
				// FAL API 的结果获取端点格式：/endpoint/requests/{requestId}
				// 先检查状态响应中是否已包含结果数据（如 images 或 video 字段）
				let resultResponse: IDataObject;
				
				// 检查状态响应中是否已包含结果数据
				if (statusResponse.images || statusResponse.video || (statusResponse as IDataObject).output) {
					// 状态响应中已包含结果数据，直接使用
					resultResponse = statusResponse as IDataObject;
				} else {
					// 需要单独获取结果
					try {
						const resultUrl = `${this.getAsyncBaseUrl()}${config.endpoint}/requests/${requestId}`;
						resultResponse = await this.makeRequest('GET', resultUrl);
					} catch (error: unknown) {
						// 如果获取结果失败（422/404），尝试使用状态响应
						const err = error as { response?: { statusCode?: number; body?: IDataObject } };
						if (err.response?.statusCode === 422 || err.response?.statusCode === 404) {
							// 422 或 404 可能表示结果已经在状态响应中，或者端点格式不对
							// 尝试使用状态响应作为结果
							resultResponse = statusResponse as IDataObject;
						} else {
							throw error;
						}
					}
				}

				return {
					json: this.processAsyncResponse(resultResponse as AsyncResultResponse),
					pairedItem: { item: this.itemIndex },
				};
			}

			if (statusResponse.status === 'FAILED') {
				throw new NodeOperationError(
					this.executeFunctions.getNode(),
					`Async request failed: ${(statusResponse.error as string) || 'Unknown error'}`,
					{ itemIndex: this.itemIndex },
				);
			}

			// 等待后继续轮询
			// Use a simple delay using busy wait to avoid restricted globals
			const delay = (ms: number) => {
				const start = Date.now();
				while (Date.now() - start < ms) {
					// Busy wait - acceptable for short polling intervals
				}
			};
			delay(pollInterval);
		}
	}

	protected abstract processSyncResponse(response: SyncResponse): IDataObject;
	protected abstract processAsyncResponse(response: AsyncResultResponse): IDataObject;
}
