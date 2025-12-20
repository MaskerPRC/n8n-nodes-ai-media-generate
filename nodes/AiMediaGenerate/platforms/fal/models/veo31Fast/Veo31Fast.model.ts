import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Veo31FastModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veo31Fast',
			displayName: 'Veo 3.1 Fast',
			endpoint: '/fal-ai/veo3.1/fast',
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
				description:
					'The text prompt describing the video you want to generate. For best results, prompts should be descriptive and clear. Include: Subject (what you want in the video), Context (background/setting), Action (what the subject is doing), Style (film style keywords), Camera motion (optional), Composition (optional), Ambiance (optional).',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
				type: 'options',
				options: [
					{
						name: '16:9 (Landscape)',
						value: '16:9',
					},
					{
						name: '9:16 (Portrait)',
						value: '9:16',
					},
				],
				default: '16:9',
				description: 'Aspect ratio of the generated video',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '4 Seconds',
						value: '4s',
					},
					{
						name: '6 Seconds',
						value: '6s',
					},
					{
						name: '8 Seconds',
						value: '8s',
					},
				],
				default: '8s',
				description: 'The duration of the generated video at 24 FPS',
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
				description: 'The resolution of the generated video',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negative_prompt',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description: 'A negative prompt to guide the video generation',
			},
			{
				displayName: 'Generate Audio',
				name: 'generate_audio',
				type: 'boolean',
				default: true,
				description: 'Whether to generate audio for the video',
			},
			{
				displayName: 'Auto Fix',
				name: 'auto_fix',
				type: 'boolean',
				default: true,
				description:
					'Whether to automatically attempt to fix prompts that fail content policy or other validation checks by rewriting them',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'The seed for the random number generator. Leave empty for random seed.',
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
		const aspectRatio = this.executeFunctions.getNodeParameter('aspect_ratio', this.itemIndex) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		const negativePrompt = this.executeFunctions.getNodeParameter(
			'negative_prompt',
			this.itemIndex,
		) as string;
		if (negativePrompt) {
			params.negative_prompt = negativePrompt;
		}

		const generateAudio = this.executeFunctions.getNodeParameter(
			'generate_audio',
			this.itemIndex,
		) as boolean;
		if (generateAudio !== undefined && generateAudio !== null) {
			params.generate_audio = generateAudio;
		}

		const autoFix = this.executeFunctions.getNodeParameter('auto_fix', this.itemIndex) as boolean;
		if (autoFix !== undefined && autoFix !== null) {
			params.auto_fix = autoFix;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Veo 3.1 Fast 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

