import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class SeedDream45EditModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'seedDream45Edit',
			displayName: 'SeedDream 4.5 Edit',
			endpoint: '/fal-ai/bytedance/seedream/v4.5/edit',
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
				description: 'The text prompt used to edit the image',
			},
			{
				displayName: 'Image URLs',
				name: 'image_urls',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Image URL',
				},
				default: [],
				required: true,
				description:
					'List of URLs of input images for editing. Up to 10 image inputs are allowed. Can be publicly accessible URLs or base64 data URIs.',
			},
			{
				displayName: 'Image Size Type',
				name: 'image_size_type',
				type: 'options',
				options: [
					{
						name: 'Preset Size',
						value: 'preset',
					},
					{
						name: 'Custom Size',
						value: 'custom',
					},
				],
				default: 'preset',
				description: 'Choose between preset sizes or custom width/height',
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
				default: 'auto_4K',
				displayOptions: {
					show: {
						image_size_type: ['preset'],
					},
				},
				description:
					'The size of the generated image. Width and height must be between 1920 and 4096, or total number of pixels must be between 2560*1440 and 4096*4096.',
			},
			{
				displayName: 'Image Width',
				name: 'image_width',
				type: 'number',
				default: 1920,
				displayOptions: {
					show: {
						image_size_type: ['custom'],
					},
				},
				description: 'Width of the generated image (between 1920 and 4096)',
			},
			{
				displayName: 'Image Height',
				name: 'image_height',
				type: 'number',
				default: 1080,
				displayOptions: {
					show: {
						image_size_type: ['custom'],
					},
				},
				description: 'Height of the generated image (between 1920 and 4096)',
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
					'If set to a number greater than one, enables multi-image generation. The model will potentially return up to max_images images every generation. The total number of images (image inputs + image outputs) must not exceed 15',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description: 'Random seed to control the stochasticity of image generation',
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

		const imageUrls = this.executeFunctions.getNodeParameter('image_urls', this.itemIndex);
		if (!imageUrls) {
			throw new Error('Image URLs are required');
		}

		// 处理多种输入格式
		let urls: string[] = [];
		if (Array.isArray(imageUrls)) {
			// n8n 的 multipleValues 可能返回对象数组或字符串数组
			urls = imageUrls
				.map((item) => {
					if (typeof item === 'string') {
						return item;
					}
					// 如果是对象，尝试获取值
					return (item as IDataObject)?.value || (item as IDataObject)?.url || item;
				})
				.filter((url) => url && String(url).trim() !== '')
				.map((url) => String(url).trim());
		} else if (typeof imageUrls === 'string' && imageUrls.trim() !== '') {
			urls = [imageUrls.trim()];
		}

		if (urls.length === 0) {
			throw new Error('At least one image URL is required');
		}

		// 限制最多10张图片
		if (urls.length > 10) {
			urls = urls.slice(-10);
		}

		params.image_urls = urls;

		// 处理图片尺寸
		const imageSizeType = this.executeFunctions.getNodeParameter(
			'image_size_type',
			this.itemIndex,
		) as string;
		if (imageSizeType === 'preset') {
			const imageSize = this.executeFunctions.getNodeParameter(
				'image_size',
				this.itemIndex,
			) as string;
			if (imageSize) {
				params.image_size = imageSize;
			}
		} else if (imageSizeType === 'custom') {
			const width = this.executeFunctions.getNodeParameter('image_width', this.itemIndex) as number;
			const height = this.executeFunctions.getNodeParameter(
				'image_height',
				this.itemIndex,
			) as number;
			if (width && height) {
				// 验证尺寸范围
				if (width < 1920 || width > 4096 || height < 1920 || height > 4096) {
					throw new Error('Image width and height must be between 1920 and 4096');
				}
				const totalPixels = width * height;
				if (totalPixels < 2560 * 1440 || totalPixels > 4096 * 4096) {
					throw new Error(
						'Total number of pixels must be between 2560*1440 and 4096*4096',
					);
				}
				params.image_size = {
					width,
					height,
				};
			}
		}

		// 可选参数
		const numImages = this.executeFunctions.getNodeParameter('num_images', this.itemIndex) as number;
		if (numImages !== undefined && numImages !== null && numImages > 0) {
			params.num_images = numImages;
		}

		const maxImages = this.executeFunctions.getNodeParameter('max_images', this.itemIndex) as number;
		if (maxImages !== undefined && maxImages !== null && maxImages > 0) {
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
		// 直接返回原始响应，保留所有字段
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

