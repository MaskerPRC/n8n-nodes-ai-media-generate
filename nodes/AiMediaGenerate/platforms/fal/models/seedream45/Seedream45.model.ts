import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Seedream45Model extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'seedream45',
			displayName: 'Seedream 4.5',
			endpoint: '/fal-ai/bytedance/seedream/v4.5/text-to-image',
			supportsSync: false,
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
				description: 'The text prompt used to generate the image',
			},
			{
				displayName: 'Image Size',
				name: 'image_size',
				type: 'options',
				options: [
					{
						name: 'Auto 2K',
						value: 'auto_2K',
					},
					{
						name: 'Auto 4K',
						value: 'auto_4K',
					},
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
				default: 'auto_2K',
				description:
					'The size of the generated image. Width and height must be between 1920 and 4096, or total number of pixels must be between 2560*1440 and 4096*4096.',
			},
			{
				displayName: 'Custom Width',
				name: 'image_size_width',
				type: 'number',
				default: 1920,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom width for the image (1920-4096)',
			},
			{
				displayName: 'Custom Height',
				name: 'image_size_height',
				type: 'number',
				default: 1080,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom height for the image (1920-4096)',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				description: 'Number of separate model generations to be run with the prompt',
			},
			{
				displayName: 'Max Images',
				name: 'max_images',
				type: 'number',
				default: 1,
				description:
					'If set to a number greater than one, enables multi-image generation. The model will potentially return up to max_images images every generation, and in total, num_images generations will be carried out.',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description: 'Random seed to control the stochasticity of image generation. Leave empty for random seed.',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				description: 'Whether to return the media as a data URI. If True, the output data won\'t be available in the request history.',
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
		const numImages = this.executeFunctions.getNodeParameter('num_images', this.itemIndex) as number;
		if (numImages !== undefined && numImages !== null) {
			params.num_images = numImages;
		}

		const maxImages = this.executeFunctions.getNodeParameter('max_images', this.itemIndex) as number;
		if (maxImages !== undefined && maxImages !== null) {
			params.max_images = maxImages;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '' && typeof seed === 'number') {
			params.seed = seed;
		}

		const syncMode = this.executeFunctions.getNodeParameter('sync_mode', this.itemIndex) as boolean;
		params.sync_mode = syncMode;

		const enableSafetyChecker = this.executeFunctions.getNodeParameter(
			'enable_safety_checker',
			this.itemIndex,
		) as boolean;
		params.enable_safety_checker = enableSafetyChecker;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Seedream 4.5 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

