import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class AuroraModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'aurora',
			displayName: 'Aurora',
			endpoint: '/fal-ai/creatify/aurora',
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
					'URL of the image file to be used for video generation. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the audio file to be used for video generation. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'A text prompt to guide the video generation process',
			},
			{
				displayName: 'Guidance Scale',
				name: 'guidance_scale',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberStepSize: 0.1,
				},
				default: 1,
				description: 'Guidance scale to be used for text prompt adherence',
			},
			{
				displayName: 'Audio Guidance Scale',
				name: 'audio_guidance_scale',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberStepSize: 0.1,
				},
				default: 2,
				description: 'Guidance scale to be used for audio adherence',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '480p',
						value: '480p',
					},
					{
						name: '720p',
						value: '720p',
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

		// 必需参数：audio_url
		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		if (!audioUrl || audioUrl.trim() === '') {
			throw new Error('Audio URL is required');
		}
		params.audio_url = audioUrl.trim();

		// 可选参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (prompt && prompt.trim() !== '') {
			params.prompt = prompt.trim();
		}

		// 可选参数：guidance_scale
		const guidanceScale = this.executeFunctions.getNodeParameter(
			'guidance_scale',
			this.itemIndex,
		) as number;
		if (guidanceScale !== undefined && guidanceScale !== null) {
			params.guidance_scale = guidanceScale;
		}

		// 可选参数：audio_guidance_scale
		const audioGuidanceScale = this.executeFunctions.getNodeParameter(
			'audio_guidance_scale',
			this.itemIndex,
		) as number;
		if (audioGuidanceScale !== undefined && audioGuidanceScale !== null) {
			params.audio_guidance_scale = audioGuidanceScale;
		}

		// 可选参数：resolution
		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Aurora 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}


