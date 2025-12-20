import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class GptImage15Model extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'gptImage15',
			displayName: 'GPT Image 1.5 (Edit)',
			endpoint: '/fal-ai/gpt-image-1.5/edit',
			syncEndpoint: '/fal-ai/gpt-image-1.5/edit/stream',
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
				description: 'The prompt for image generation',
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
					'The URLs of the images to use as a reference for the generation. Can be publicly accessible URLs or base64 data URIs.',
			},
			{
				displayName: 'Image Size',
				name: 'image_size',
				type: 'options',
				options: [
					{
						name: 'Auto',
						value: 'auto',
					},
					{
						name: '1024x1024',
						value: '1024x1024',
					},
					{
						name: '1536x1024',
						value: '1536x1024',
					},
					{
						name: '1024x1536',
						value: '1024x1536',
					},
				],
				default: 'auto',
				description: 'Aspect ratio for the generated image',
			},
			{
				displayName: 'Background',
				name: 'background',
				type: 'options',
				options: [
					{
						name: 'Auto',
						value: 'auto',
					},
					{
						name: 'Transparent',
						value: 'transparent',
					},
					{
						name: 'Opaque',
						value: 'opaque',
					},
				],
				default: 'auto',
				description: 'Background for the generated image',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'options',
				options: [
					{
						name: 'Low',
						value: 'low',
					},
					{
						name: 'Medium',
						value: 'medium',
					},
					{
						name: 'High',
						value: 'high',
					},
				],
				default: 'high',
				description: 'Quality for the generated image',
			},
			{
				displayName: 'Input Fidelity',
				name: 'input_fidelity',
				type: 'options',
				options: [
					{
						name: 'Low',
						value: 'low',
					},
					{
						name: 'High',
						value: 'high',
					},
				],
				default: 'high',
				description: 'Input fidelity for the generated image',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				description: 'Number of images to generate',
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
				description: 'Output format for the images',
			},
			{
				displayName: 'Mask Image URL',
				name: 'mask_image_url',
				type: 'string',
				default: '',
				description:
					'The URL of the mask image to use for the generation. This indicates what part of the image to edit.',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				description: 'Whether to return the media as a data URI and make the output data unavailable in the request history',
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

		params.image_urls = urls;

		// 可选参数
		const imageSize = this.executeFunctions.getNodeParameter('image_size', this.itemIndex) as string;
		if (imageSize && imageSize !== 'auto') {
			params.image_size = imageSize;
		}

		const background = this.executeFunctions.getNodeParameter('background', this.itemIndex) as string;
		if (background && background !== 'auto') {
			params.background = background;
		}

		const quality = this.executeFunctions.getNodeParameter('quality', this.itemIndex) as string;
		if (quality) {
			params.quality = quality;
		}

		const inputFidelity = this.executeFunctions.getNodeParameter(
			'input_fidelity',
			this.itemIndex,
		) as string;
		if (inputFidelity) {
			params.input_fidelity = inputFidelity;
		}

		const numImages = this.executeFunctions.getNodeParameter('num_images', this.itemIndex) as number;
		if (numImages !== undefined && numImages !== null) {
			params.num_images = numImages;
		}

		const outputFormat = this.executeFunctions.getNodeParameter('output_format', this.itemIndex) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		const maskImageUrl = this.executeFunctions.getNodeParameter(
			'mask_image_url',
			this.itemIndex,
		) as string;
		if (maskImageUrl && maskImageUrl.trim() !== '') {
			params.mask_image_url = maskImageUrl.trim();
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
