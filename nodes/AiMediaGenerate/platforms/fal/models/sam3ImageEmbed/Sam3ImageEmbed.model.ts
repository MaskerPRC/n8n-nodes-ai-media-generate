import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Sam3ImageEmbedModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'sam3ImageEmbed',
			displayName: 'SAM 3 Image Embedding',
			endpoint: '/fal-ai/sam-3/image/embed',
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
					'URL of the image to embed. Can be a publicly accessible URL or a base64 data URI.',
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

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// SAM 3 Image Embedding 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 embedding_b64）
		return response;
	}
}

