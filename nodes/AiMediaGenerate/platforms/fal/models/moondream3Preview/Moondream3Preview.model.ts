import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Moondream3PreviewModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'moondream3Preview',
			displayName: 'Moondream 3 Preview (Query)',
			endpoint: '/fal-ai/moondream3-preview/query',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'image',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the image to be processed. Can be a publicly accessible URL or a base64 data URI. Max width: 7000px, Max height: 7000px, Timeout: 20.0s',
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
				description: 'Query to be asked about the image',
			},
			{
				displayName: 'Reasoning',
				name: 'reasoning',
				type: 'boolean',
				default: true,
				description: 'Whether to include detailed reasoning behind the answer',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0,
				description:
					'Sampling temperature to use, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.',
			},
			{
				displayName: 'Top P',
				name: 'top_p',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 1,
				description: 'Nucleus sampling probability mass to use, between 0 and 1',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：image_url
		const imageUrl = this.executeFunctions.getNodeParameter('image_url', this.itemIndex) as string;
		if (!imageUrl || imageUrl.trim() === '') {
			throw new Error('Image URL is required');
		}
		params.image_url = imageUrl.trim();

		// 必需参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt.trim();

		// 可选参数：reasoning
		const reasoning = this.executeFunctions.getNodeParameter('reasoning', this.itemIndex) as boolean;
		if (reasoning !== undefined && reasoning !== null) {
			params.reasoning = reasoning;
		}

		// 可选参数：temperature
		const temperature = this.executeFunctions.getNodeParameter('temperature', this.itemIndex) as number;
		if (temperature !== undefined && temperature !== null) {
			params.temperature = temperature;
		}

		// 可选参数：top_p
		const topP = this.executeFunctions.getNodeParameter('top_p', this.itemIndex) as number;
		if (topP !== undefined && topP !== null) {
			params.top_p = topP;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Moondream 3 Preview 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 output, reasoning, usage_info, finish_reason）
		return response;
	}
}

