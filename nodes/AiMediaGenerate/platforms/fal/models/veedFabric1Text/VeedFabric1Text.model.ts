import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class VeedFabric1TextModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veedFabric1Text',
			displayName: 'VEED Fabric-One Text',
			endpoint: '/veed/fabric-1.0/text',
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
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The text to convert to speech for the talking video',
			},
			{
				displayName: 'Voice Description',
				name: 'voice_description',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description:
					'Optional additional voice description. The primary voice description is auto-generated from the image. You can use simple descriptors like "British accent" or "Confident" or provide a detailed description like "Confident male voice, mid-20s, with notes of..."',
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

		// 必需参数：text
		const text = this.executeFunctions.getNodeParameter('text', this.itemIndex) as string;
		if (!text || text.trim() === '') {
			throw new Error('Text is required');
		}
		params.text = text.trim();

		// 可选参数：voice_description
		const voiceDescription = this.executeFunctions.getNodeParameter(
			'voice_description',
			this.itemIndex,
		) as string;
		if (voiceDescription && voiceDescription.trim() !== '') {
			params.voice_description = voiceDescription.trim();
		}

		// 可选参数：resolution
		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// VEED Fabric-One Text 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}

