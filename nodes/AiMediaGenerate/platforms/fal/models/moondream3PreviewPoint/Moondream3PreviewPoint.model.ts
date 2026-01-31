import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Moondream3PreviewPointModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'moondream3PreviewPoint',
			displayName: 'Moondream 3 Preview Point Object Detection',
			endpoint: '/fal-ai/moondream3-preview/point',
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
					rows: 2,
				},
				default: '',
				required: true,
				description: 'Object to be located in the image',
			},
			{
				displayName: 'Preview',
				name: 'preview',
				type: 'boolean',
				default: false,
				description: 'Whether to preview the output',
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

		// 可选参数：preview
		const preview = this.executeFunctions.getNodeParameter('preview', this.itemIndex) as boolean;
		if (preview !== undefined && preview !== null) {
			params.preview = preview;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Moondream 3 Preview Point 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（points, image, usage_info, finish_reason）
		return response;
	}
}


