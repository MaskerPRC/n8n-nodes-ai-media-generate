import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Q2TextToVideoModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'q2TextToVideo',
			displayName: 'Vidu Q2 Text To Video',
			endpoint: '/fal-ai/vidu/q2/text-to-video',
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
						name: '360p',
						value: '360p',
					},
					{
						name: '520p',
						value: '520p',
					},
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
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
				type: 'options',
				options: [
					{
						name: '16:9',
						value: '16:9',
					},
					{
						name: '9:16',
						value: '9:16',
					},
					{
						name: '1:1',
						value: '1:1',
					},
				],
				default: '16:9',
				description: 'The aspect ratio of the output video',
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
				displayName: 'Background Music (BGM)',
				name: 'bgm',
				type: 'boolean',
				default: false,
				description: 'Whether to add background music to the video (only for 4-second videos)',
				displayOptions: {
					show: {
						duration: ['4'],
					},
				},
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
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		// 可选参数
		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		const aspectRatio = this.executeFunctions.getNodeParameter('aspect_ratio', this.itemIndex) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

		const movementAmplitude = this.executeFunctions.getNodeParameter(
			'movement_amplitude',
			this.itemIndex,
		) as string;
		if (movementAmplitude) {
			params.movement_amplitude = movementAmplitude;
		}

		const bgm = this.executeFunctions.getNodeParameter('bgm', this.itemIndex) as boolean;
		if (bgm !== undefined && bgm !== null) {
			params.bgm = bgm;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Q2 Text To Video 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

