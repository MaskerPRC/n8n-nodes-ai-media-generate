import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class OpenRouterVisionModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'openrouterVision',
			displayName: 'OpenRouter Vision (VLM)',
			endpoint: '/openrouter/router/vision',
			syncEndpoint: '/openrouter/router/vision/stream',
			supportsSync: true,
			supportsAsync: true,
			modelType: 'image', // 使用图片类型的超时时间
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
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
					'The URLs of the images to process. Can be publicly accessible URLs or base64 data URIs.',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The prompt to be used for the image',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'google/gemini-2.5-flash',
				required: true,
				description:
					'Name of the model to use. Charged based on actual token usage. Examples: google/gemini-2.5-flash, google/gemini-2.0-flash-exp, etc.',
			},
			{
				displayName: 'System Prompt',
				name: 'system_prompt',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description:
					'System prompt to provide context or instructions to the model',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberStepSize: 0.1,
				},
				default: 1,
				description:
					'This setting influences the variety in the model\'s responses. Lower values lead to more predictable and typical responses, while higher values encourage more diverse and less common responses. At 0, the model always gives the same response for a given input.',
			},
			{
				displayName: 'Max Tokens',
				name: 'max_tokens',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: '',
				description:
					'This sets the upper limit for the number of tokens the model can generate in response. It won\'t produce more than this limit. The maximum value is the context length minus the prompt length.',
			},
			{
				displayName: 'Reasoning',
				name: 'reasoning',
				type: 'boolean',
				default: false,
				description:
					'Whether reasoning should be part of the final answer',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：image_urls
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

		// 必需参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt.trim();

		// 必需参数：model
		const model = this.executeFunctions.getNodeParameter('model', this.itemIndex) as string;
		if (!model || model.trim() === '') {
			throw new Error('Model is required');
		}
		params.model = model.trim();

		// 可选参数：system_prompt
		const systemPrompt = this.executeFunctions.getNodeParameter(
			'system_prompt',
			this.itemIndex,
		) as string;
		if (systemPrompt && systemPrompt.trim() !== '') {
			params.system_prompt = systemPrompt.trim();
		}

		// 可选参数：temperature
		const temperature = this.executeFunctions.getNodeParameter(
			'temperature',
			this.itemIndex,
		) as number;
		if (temperature !== undefined && temperature !== null) {
			params.temperature = temperature;
		}

		// 可选参数：max_tokens
		const maxTokens = this.executeFunctions.getNodeParameter('max_tokens', this.itemIndex);
		if (maxTokens !== undefined && maxTokens !== null && maxTokens !== '') {
			const maxTokensNum = Number(maxTokens);
			if (!isNaN(maxTokensNum) && maxTokensNum > 0) {
				params.max_tokens = maxTokensNum;
			}
		}

		// 可选参数：reasoning
		const reasoning = this.executeFunctions.getNodeParameter('reasoning', this.itemIndex) as boolean;
		if (reasoning !== undefined && reasoning !== null) {
			params.reasoning = reasoning;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 output 和 usage）
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 output 和 usage）
		return response;
	}
}

