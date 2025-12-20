import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseGenboModel } from '../../shared/baseGenboModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Flux2EditModel extends BaseGenboModel {
	getConfig(): ModelConfig {
		return {
			name: 'flux2Edit',
			displayName: 'Flux.2-edit',
			endpoint: '/v1/images/generations',
			supportsSync: false,
			supportsAsync: true,
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
				description: 'The text prompt describing the desired image edit',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				description: 'The URL of the image to edit',
			},
			{
				displayName: 'Image Size',
				name: 'image_size',
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
						name: '3:4',
						value: '3:4',
					},
					{
						name: '4:3',
						value: '4:3',
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
				description: 'The size of the generated image',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {
			model: 'Flux.2-edit',
		};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		const imageUrl = this.executeFunctions.getNodeParameter('image_url', this.itemIndex) as string;
		if (!imageUrl) {
			throw new Error('Image URL is required');
		}
		params.image_url = imageUrl;

		// 可选参数
		const imageSize = this.executeFunctions.getNodeParameter('image_size', this.itemIndex) as string;
		if (imageSize) {
			params.image_size = imageSize;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Flux.2-edit 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

