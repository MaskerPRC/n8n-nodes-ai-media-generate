import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Wan26I2VModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'wan26i2v',
			displayName: 'WAN 2.6 Image-to-Video',
			endpoint: '/wan/v2.6/image-to-video',
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
				description: 'The text prompt describing the desired video motion. Max 800 characters.',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the image to use as the first frame. Must be publicly accessible or base64 data URI. Image dimensions must be between 240 and 7680.',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				description:
					'URL of the audio to use as the background music. Must be publicly accessible. Format: WAV, MP3. Duration: 3 to 30s. File size: Up to 15MB.',
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
				default: '1080p',
				description: 'Video resolution',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '5 Seconds',
						value: '5',
					},
					{
						name: '10 Seconds',
						value: '10',
					},
					{
						name: '15 Seconds',
						value: '15',
					},
				],
				default: '5',
				description: 'Duration of the generated video in seconds',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negative_prompt',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description: 'Negative prompt to describe content to avoid. Max 500 characters.',
			},
			{
				displayName: 'Enable Prompt Expansion',
				name: 'enable_prompt_expansion',
				type: 'boolean',
				default: true,
				description: 'Whether to enable prompt rewriting using LLM',
			},
			{
				displayName: 'Multi Shots',
				name: 'multi_shots',
				type: 'boolean',
				default: true,
				description:
					'Whether to enable intelligent multi-shot segmentation. Only active when enable_prompt_expansion is True.',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description: 'Random seed for reproducibility. Leave empty for random seed.',
			},
			{
				displayName: 'Enable Safety Checker',
				name: 'enable_safety_checker',
				type: 'boolean',
				default: true,
				description: 'Whether to enable the safety checker',
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
		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		if (audioUrl) {
			params.audio_url = audioUrl;
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		const negativePrompt = this.executeFunctions.getNodeParameter(
			'negative_prompt',
			this.itemIndex,
		) as string;
		if (negativePrompt) {
			params.negative_prompt = negativePrompt;
		}

		const enablePromptExpansion = this.executeFunctions.getNodeParameter(
			'enable_prompt_expansion',
			this.itemIndex,
		) as boolean;
		params.enable_prompt_expansion = enablePromptExpansion;

		const multiShots = this.executeFunctions.getNodeParameter('multi_shots', this.itemIndex) as boolean;
		params.multi_shots = multiShots;

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '' && typeof seed === 'number') {
			params.seed = seed;
		}

		const enableSafetyChecker = this.executeFunctions.getNodeParameter(
			'enable_safety_checker',
			this.itemIndex,
		) as boolean;
		params.enable_safety_checker = enableSafetyChecker;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// WAN 2.6 I2V 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

