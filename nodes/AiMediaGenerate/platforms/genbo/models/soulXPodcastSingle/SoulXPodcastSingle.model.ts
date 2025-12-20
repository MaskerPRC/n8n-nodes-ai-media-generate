import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BaseGenboModel } from '../../shared/baseGenboModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class SoulXPodcastSingleModel extends BaseGenboModel {
	getConfig(): ModelConfig {
		return {
			name: 'soulXPodcastSingle',
			displayName: 'SoulX-Podcast-Single',
			endpoint: '/v1/audio/generations',
			supportsSync: false,
			supportsAsync: true,
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The text prompt describing the desired audio content',
			},
			{
				displayName: 'Choose Language',
				name: 'choose_language',
				type: 'number',
				default: 1,
				description: 'Language selection (1 for default)',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',

				description: 'The URL of the audio file to use for audio generation (optional)',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.6,
				description: 'Temperature parameter for audio generation (0.0 to 1.0)',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {
			model: 'SoulX-Podcast-Single',
		};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Prompt is required',
				{ itemIndex: this.itemIndex },
			);
		}
		params.prompt = prompt;

		// 可选参数
		const chooseLanguage = this.executeFunctions.getNodeParameter(
			'choose_language',
			this.itemIndex,
		) as number;
		if (chooseLanguage !== undefined && chooseLanguage !== null) {
			params.choose_language = chooseLanguage;
		}

		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		if (audioUrl) {
			params.audio_url = audioUrl;
		}

		const temperature = this.executeFunctions.getNodeParameter(
			'temperature',
			this.itemIndex,
		) as number;
		if (temperature !== undefined && temperature !== null) {
			params.temperature = temperature;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// SoulX-Podcast-Single 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}

	// 重写 executeAsync 方法，因为音频生成的状态检查端点格式不同
	async executeAsync(): Promise<import('n8n-workflow').INodeExecutionData> {
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
			// 音频生成的状态检查端点格式：/v1/audio/generations/:task_id
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
				// 如果 task_result 是对象且包含 url 字段
				if (typeof taskResult === 'object' && taskResult.url) {
					hasResult = true;
				}
			}

			// 检查其他可能的结果字段
			if (!hasResult) {
				hasResult = !!(statusResponse.result || statusResponse.url);
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

