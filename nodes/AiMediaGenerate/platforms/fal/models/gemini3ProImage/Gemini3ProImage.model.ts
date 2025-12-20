import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Gemini3ProImageModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'gemini3ProImage',
			displayName: 'Gemini 3 Pro Image (Edit)',
			endpoint: '/fal-ai/nano-banana-pro/edit',
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
				description: 'The prompt for image editing',
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
				description:
					'The URLs of the images to use for image-to-image generation or image editing. Can be publicly accessible URLs or base64 data URIs.',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				description: 'The number of images to generate',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
				type: 'options',
				options: [
					{
						name: '1:1',
						value: '1:1',
					},
					{
						name: '16:9',
						value: '16:9',
					},
					{
						name: '2:3',
						value: '2:3',
					},
					{
						name: '21:9',
						value: '21:9',
					},
					{
						name: '3:2',
						value: '3:2',
					},
					{
						name: '3:4',
						value: '3:4',
					},
					{
						name: '4:3',
						value: '4:3',
					},
					{
						name: '4:5',
						value: '4:5',
					},
					{
						name: '5:4',
						value: '5:4',
					},
					{
						name: '9:16',
						value: '9:16',
					},
					{
						name: 'Auto',
						value: 'auto',
					},
				],
				default: 'auto',
				description: 'The aspect ratio of the generated image',
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
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '1K',
						value: '1K',
					},
					{
						name: '2K',
						value: '2K',
					},
					{
						name: '4K',
						value: '4K',
					},
				],
				default: '1K',
				description: 'The resolution of the image to generate',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				description: 'Whether to return the media as a data URI. If True, the output data won\'t be available in the request history.',
			},
			{
				displayName: 'Limit Generations',
				name: 'limit_generations',
				type: 'boolean',
				default: false,
				description:
					'Whether to limit the number of generations from each round of prompting to 1. This is an experimental parameter.',
			},
			{
				displayName: 'Enable Web Search',
				name: 'enable_web_search',
				type: 'boolean',
				default: false,
				description: 'Whether to enable web search for the image generation task. This will allow the model to use the latest information from the web to generate the image.',
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
		const imageUrls = this.executeFunctions.getNodeParameter('image_urls', this.itemIndex);
		if (imageUrls) {
			// 处理多种输入格式
			if (Array.isArray(imageUrls)) {
				// n8n 的 multipleValues 可能返回对象数组或字符串数组
				const urls = imageUrls
					.map((item) => {
						if (typeof item === 'string') {
							return item;
						}
						// 如果是对象，尝试获取值
						return (item as IDataObject)?.value || (item as IDataObject)?.url || item;
					})
					.filter((url) => url && String(url).trim() !== '');
				if (urls.length > 0) {
					params.image_urls = urls;
				}
			} else if (typeof imageUrls === 'string' && imageUrls.trim() !== '') {
				params.image_urls = [imageUrls];
			}
		}

		const numImages = this.executeFunctions.getNodeParameter('num_images', this.itemIndex) as number;
		if (numImages !== undefined && numImages !== null) {
			params.num_images = numImages;
		}

		const aspectRatio = this.executeFunctions.getNodeParameter(
			'aspect_ratio',
			this.itemIndex,
		) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

		const outputFormat = this.executeFunctions.getNodeParameter(
			'output_format',
			this.itemIndex,
		) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		const syncMode = this.executeFunctions.getNodeParameter('sync_mode', this.itemIndex) as boolean;
		params.sync_mode = syncMode;

		const limitGenerations = this.executeFunctions.getNodeParameter(
			'limit_generations',
			this.itemIndex,
		) as boolean;
		params.limit_generations = limitGenerations;

		const enableWebSearch = this.executeFunctions.getNodeParameter(
			'enable_web_search',
			this.itemIndex,
		) as boolean;
		params.enable_web_search = enableWebSearch;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Gemini 3 Pro Image 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

