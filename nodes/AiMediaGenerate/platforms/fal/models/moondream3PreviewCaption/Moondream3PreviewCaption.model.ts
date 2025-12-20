import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Moondream3PreviewCaptionModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'moondream3PreviewCaption',
			displayName: 'Moondream 3 Preview Caption',
			endpoint: '/fal-ai/moondream3-preview/caption',
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
				displayName: 'Length',
				name: 'length',
				type: 'options',
				options: [
					{
						name: 'Short',
						value: 'short',
					},
					{
						name: 'Normal',
						value: 'normal',
					},
					{
						name: 'Long',
						value: 'long',
					},
				],
				default: 'normal',
				description: 'Length of the caption to generate',
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
				default: '',
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

		// 可选参数：length
		const length = this.executeFunctions.getNodeParameter('length', this.itemIndex) as string;
		if (length) {
			params.length = length;
		}

		// 可选参数：temperature
		const temperature = this.executeFunctions.getNodeParameter('temperature', this.itemIndex) as
			| number
			| undefined;
		if (temperature !== undefined && temperature !== null) {
			params.temperature = temperature;
		}

		// 可选参数：top_p
		const topP = this.executeFunctions.getNodeParameter('top_p', this.itemIndex) as
			| number
			| string
			| undefined;
		if (topP !== undefined && topP !== null && topP !== '') {
			params.top_p = typeof topP === 'number' ? topP : parseFloat(String(topP));
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Moondream 3 Preview Caption 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 output, finish_reason, usage_info）
		return response;
	}
}

