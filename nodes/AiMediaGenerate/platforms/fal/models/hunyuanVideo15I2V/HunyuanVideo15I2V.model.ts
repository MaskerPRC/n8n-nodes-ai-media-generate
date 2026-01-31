import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class HunyuanVideo15I2VModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'hunyuanVideo15I2V',
			displayName: 'Hunyuan Video 1.5 Image-to-Video',
			endpoint: '/fal-ai/hunyuan-video-v1.5/image-to-video',
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
				description: 'The prompt to generate the video from',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the reference image for image-to-video generation. Can be a publicly accessible URL or a base64 data URI.',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negative_prompt',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description: 'The negative prompt to guide what not to generate',
			},
			{
				displayName: 'Number of Inference Steps',
				name: 'num_inference_steps',
				type: 'number',
				default: 28,

			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description: 'Random seed for reproducibility. Leave empty for random seed.',
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
				],
				default: '16:9',
				description: 'The aspect ratio of the video',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '480p',
						value: '480p',
					},
				],
				default: '480p',
				description: 'The resolution of the video',
			},
			{
				displayName: 'Number of Frames',
				name: 'num_frames',
				type: 'number',
				default: 121,
				description: 'The number of frames to generate',
			},
			{
				displayName: 'Enable Prompt Expansion',
				name: 'enable_prompt_expansion',
				type: 'boolean',
				default: true,
				description: 'Whether to enable prompt expansion to enhance the input prompt',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt.trim();

		// 必需参数：image_url
		const imageUrl = this.executeFunctions.getNodeParameter('image_url', this.itemIndex) as string;
		if (!imageUrl || imageUrl.trim() === '') {
			throw new Error('Image URL is required');
		}
		params.image_url = imageUrl.trim();

		// 可选参数：negative_prompt
		const negativePrompt = this.executeFunctions.getNodeParameter(
			'negative_prompt',
			this.itemIndex,
		) as string;
		if (negativePrompt && negativePrompt.trim() !== '') {
			params.negative_prompt = negativePrompt.trim();
		}

		// 可选参数：num_inference_steps
		const numInferenceSteps = this.executeFunctions.getNodeParameter(
			'num_inference_steps',
			this.itemIndex,
		) as number;
		if (numInferenceSteps !== undefined && numInferenceSteps !== null) {
			params.num_inference_steps = numInferenceSteps;
		}

		// 可选参数：seed
		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '' && typeof seed === 'number') {
			params.seed = seed;
		}

		// 可选参数：aspect_ratio
		const aspectRatio = this.executeFunctions.getNodeParameter('aspect_ratio', this.itemIndex) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

		// 可选参数：resolution
		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		// 可选参数：num_frames
		const numFrames = this.executeFunctions.getNodeParameter('num_frames', this.itemIndex) as number;
		if (numFrames !== undefined && numFrames !== null) {
			params.num_frames = numFrames;
		}

		// 可选参数：enable_prompt_expansion
		const enablePromptExpansion = this.executeFunctions.getNodeParameter(
			'enable_prompt_expansion',
			this.itemIndex,
		) as boolean;
		if (enablePromptExpansion !== undefined && enablePromptExpansion !== null) {
			params.enable_prompt_expansion = enablePromptExpansion;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Hunyuan Video 1.5 Image-to-Video 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video 对象）
		return response;
	}
}

