import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class KlingV1StandardI2VModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'klingV1StandardI2V',
			displayName: 'Kling Video O1 Standard (Image-to-Video)',
			endpoint: '/fal-ai/kling-video/o1/standard/image-to-video',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
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
				description:
					'Use @Image1 to reference the start frame, @Image2 to reference the end frame. The text prompt describing the desired video transition.',
			},
			{
				displayName: 'Start Image URL',
				name: 'start_image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'Image to use as the first frame of the video. Max file size: 10.0MB, Min width: 300px, Min height: 300px, Min aspect ratio: 0.40, Max aspect ratio: 2.50, Timeout: 20.0s. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'End Image URL',
				name: 'end_image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'Image to use as the last frame of the video. Max file size: 10.0MB, Min width: 300px, Min height: 300px, Min aspect ratio: 0.40, Max aspect ratio: 2.50, Timeout: 20.0s. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '5 Seconds',
						value: '5',
					},
					{
						name: '10 Seconds',
						value: '10',
					},
				],
				default: '5',
				description: 'Video duration in seconds. Default value: "5"',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt.trim();

		// 必需参数：start_image_url
		const startImageUrl = this.executeFunctions.getNodeParameter(
			'start_image_url',
			this.itemIndex,
		) as string;
		if (!startImageUrl || startImageUrl.trim() === '') {
			throw new Error('Start Image URL is required');
		}
		params.start_image_url = startImageUrl.trim();

		// 必需参数：end_image_url
		const endImageUrl = this.executeFunctions.getNodeParameter(
			'end_image_url',
			this.itemIndex,
		) as string;
		if (!endImageUrl || endImageUrl.trim() === '') {
			throw new Error('End Image URL is required');
		}
		params.end_image_url = endImageUrl.trim();

		// 可选参数：duration
		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Kling Video O1 Standard I2V 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video 对象）
		return response;
	}
}

