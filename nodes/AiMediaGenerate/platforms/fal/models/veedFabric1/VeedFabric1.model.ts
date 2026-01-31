import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class VeedFabric1Model extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veedFabric1',
			displayName: 'VEED Fabric 1.0',
			endpoint: '/veed/fabric-1.0',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
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
					'URL of the image to use for creating talking videos. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the audio to sync with the image. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '720p',
						value: '720p',
					},
					{
						name: '480p',
						value: '480p',
					},
				],
				default: '720p',
				required: true,
				description: 'The resolution of the generated video',
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

		// 必需参数：audio_url
		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		if (!audioUrl || audioUrl.trim() === '') {
			throw new Error('Audio URL is required');
		}
		params.audio_url = audioUrl.trim();

		// 必需参数：resolution
		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (!resolution) {
			throw new Error('Resolution is required');
		}
		params.resolution = resolution;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// VEED Fabric 1.0 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}


