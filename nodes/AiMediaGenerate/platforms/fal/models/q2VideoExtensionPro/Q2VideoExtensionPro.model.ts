import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Q2VideoExtensionProModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'q2VideoExtensionPro',
			displayName: 'Vidu Q2Video Extension Pro',
			endpoint: '/fal-ai/vidu/q2/video-extension/pro',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Video URL',
				name: 'video_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the video to extend. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Text prompt to guide the video extension',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '2 Seconds',
						value: '2',
					},
					{
						name: '3 Seconds',
						value: '3',
					},
					{
						name: '4 Seconds',
						value: '4',
					},
					{
						name: '5 Seconds',
						value: '5',
					},
					{
						name: '6 Seconds',
						value: '6',
					},
					{
						name: '7 Seconds',
						value: '7',
					},
				],
				default: '4',
				description: 'Duration of the extension in seconds',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '720p',
						value: '720p',
					},
					{
						name: '1080p',
						value: '1080p',
					},
				],
				default: '720p',
				description: 'Output video resolution',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'Random seed for reproducibility. If None, a random seed is chosen. Leave empty for random seed.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数
		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;
		if (!videoUrl) {
			throw new Error('Video URL is required');
		}
		params.video_url = videoUrl;

		// 可选参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (prompt) {
			params.prompt = prompt;
		}

		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '' && typeof seed === 'number') {
			params.seed = seed;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Q2 Video Extension Pro 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

