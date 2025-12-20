import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Q2ImageToVideoProModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'q2ImageToVideoPro',
			displayName: 'Vidu Q2 Image To Video Pro',
			endpoint: '/fal-ai/vidu/q2/image-to-video/pro',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
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
				description: 'Text prompt for video generation, max 3000 characters',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the image to use as the starting frame. Must be publicly accessible or base64 data URI.',
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
					{
						name: '8 Seconds',
						value: '8',
					},
				],
				default: '4',
				description: 'Duration of the video in seconds',
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
				displayName: 'Movement Amplitude',
				name: 'movement_amplitude',
				type: 'options',
				options: [
					{
						name: 'Auto',
						value: 'auto',
					},
					{
						name: 'Small',
						value: 'small',
					},
					{
						name: 'Medium',
						value: 'medium',
					},
					{
						name: 'Large',
						value: 'large',
					},
				],
				default: 'auto',
				description: 'The movement amplitude of objects in the frame',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description: 'Random seed for reproducibility. Leave empty for random seed.',
			},
			{
				displayName: 'Background Music (BGM)',
				name: 'bgm',
				type: 'boolean',
				default: false,
				description: 'Whether to add background music to the video (only for 4-second videos)',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		const imageUrl = this.executeFunctions.getNodeParameter('image_url', this.itemIndex) as string;
		if (!imageUrl) {
			throw new Error('Image URL is required');
		}
		params.image_url = imageUrl;

		// 可选参数
		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			// 将字符串转换为整数，因为 API 期望整数类型
			params.duration = parseInt(duration, 10);
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		const movementAmplitude = this.executeFunctions.getNodeParameter(
			'movement_amplitude',
			this.itemIndex,
		) as string;
		if (movementAmplitude) {
			params.movement_amplitude = movementAmplitude;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '' && typeof seed === 'number') {
			params.seed = seed;
		}

		const bgm = this.executeFunctions.getNodeParameter('bgm', this.itemIndex) as boolean;
		// 只有当 duration 为 4 时才添加 bgm 参数
		const currentDuration = duration || '4';
		if (currentDuration === '4') {
			params.bgm = bgm;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Q2 Image To Video Pro 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

