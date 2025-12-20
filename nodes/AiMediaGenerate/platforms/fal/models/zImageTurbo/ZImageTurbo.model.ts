import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class ZImageTurboModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'zImageTurbo',
			displayName: 'Z-Image Turbo',
			endpoint: '/fal-ai/z-image/turbo',
			supportsSync: true,
			supportsAsync: true,
			modelType: 'image',
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
				description: 'The prompt to generate an image from',
			},
			{
				displayName: 'Image Size',
				name: 'image_size',
				type: 'options',
				options: [
					{
						name: 'Custom',
						value: 'custom',
					},
					{
						name: 'Landscape 16:9',
						value: 'landscape_16_9',
					},
					{
						name: 'Landscape 4:3',
						value: 'landscape_4_3',
					},
					{
						name: 'Portrait 16:9',
						value: 'portrait_16_9',
					},
					{
						name: 'Portrait 4:3',
						value: 'portrait_4_3',
					},
					{
						name: 'Square',
						value: 'square',
					},
					{
						name: 'Square HD',
						value: 'square_hd',
					},
				],
				default: 'landscape_4_3',
				description: 'The size of the generated image',
			},
			{
				displayName: 'Custom Width',
				name: 'image_size_width',
				type: 'number',
				default: 1280,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom width for the image',
			},
			{
				displayName: 'Custom Height',
				name: 'image_size_height',
				type: 'number',
				default: 720,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom height for the image',
			},
			{
				displayName: 'Number of Inference Steps',
				name: 'num_inference_steps',
				type: 'number',
				default: 8,
				description: 'The number of inference steps to perform',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'The same seed and the same prompt given to the same version of the model will output the same image every time. Leave empty for random seed.',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				description: 'The number of images to generate',
			},
			{
				displayName: 'Enable Safety Checker',
				name: 'enable_safety_checker',
				type: 'boolean',
				default: true,
				description: 'Whether to enable the safety checker',
			},
			{
				displayName: 'Enable Prompt Expansion',
				name: 'enable_prompt_expansion',
				type: 'boolean',
				default: false,
				description:
					'Whether to enable prompt expansion. Note: this will increase the price by 0.0025 credits per request.',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{
						name: 'JPEG',
						value: 'jpeg',
					},
					{
						name: 'PNG',
						value: 'png',
					},
					{
						name: 'WebP',
						value: 'webp',
					},
				],
				default: 'png',
				description: 'The format of the generated image',
			},
			{
				displayName: 'Acceleration',
				name: 'acceleration',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Regular',
						value: 'regular',
					},
					{
						name: 'High',
						value: 'high',
					},
				],
				default: 'none',
				description: 'The acceleration level to use',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				description: 'Whether to return the media as a data URI. If True, the output data won\'t be available in the request history.',
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

		// Image size 处理
		const imageSize = this.executeFunctions.getNodeParameter('image_size', this.itemIndex) as string;
		if (imageSize === 'custom') {
			const width = this.executeFunctions.getNodeParameter('image_size_width', this.itemIndex) as number;
			const height = this.executeFunctions.getNodeParameter('image_size_height', this.itemIndex) as number;
			params.image_size = {
				width,
				height,
			};
		} else if (imageSize) {
			params.image_size = imageSize;
		}

		// 可选参数
		const numInferenceSteps = this.executeFunctions.getNodeParameter(
			'num_inference_steps',
			this.itemIndex,
		) as number;
		if (numInferenceSteps !== undefined && numInferenceSteps !== null) {
			params.num_inference_steps = numInferenceSteps;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		const numImages = this.executeFunctions.getNodeParameter('num_images', this.itemIndex) as number;
		if (numImages !== undefined && numImages !== null) {
			params.num_images = numImages;
		}

		const enableSafetyChecker = this.executeFunctions.getNodeParameter(
			'enable_safety_checker',
			this.itemIndex,
		) as boolean;
		params.enable_safety_checker = enableSafetyChecker;

		const enablePromptExpansion = this.executeFunctions.getNodeParameter(
			'enable_prompt_expansion',
			this.itemIndex,
		) as boolean;
		params.enable_prompt_expansion = enablePromptExpansion;

		const outputFormat = this.executeFunctions.getNodeParameter('output_format', this.itemIndex) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		const acceleration = this.executeFunctions.getNodeParameter('acceleration', this.itemIndex) as string;
		if (acceleration) {
			params.acceleration = acceleration;
		}

		const syncMode = this.executeFunctions.getNodeParameter('sync_mode', this.itemIndex) as boolean;
		params.sync_mode = syncMode;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

