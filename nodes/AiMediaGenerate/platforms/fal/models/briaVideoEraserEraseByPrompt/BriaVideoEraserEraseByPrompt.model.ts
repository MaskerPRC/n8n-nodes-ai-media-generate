import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class BriaVideoEraserEraseByPromptModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'briaVideoEraserEraseByPrompt',
			displayName: 'Bria Video Eraser (Erase By Prompt)',
			endpoint: '/bria/bria_video_eraser/erase/prompt',
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
				description: 'Input prompt to detect object to erase',
			},
			{
				displayName: 'Video URL',
				name: 'video_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'Input video to erase object from. Duration must be less than 5s. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Output Container and Codec',
				name: 'output_container_and_codec',
				type: 'options',
				options: [
					{
						name: 'GIF',
						value: 'gif',
					},
					{
						name: 'MKV H.264',
						value: 'mkv_h264',
					},
					{
						name: 'MKV H.265',
						value: 'mkv_h265',
					},
					{
						name: 'MKV MPEG4',
						value: 'mkv_mpeg4',
					},
					{
						name: 'MKV VP9',
						value: 'mkv_vp9',
					},
					{
						name: 'MOV H.264',
						value: 'mov_h264',
					},
					{
						name: 'MOV H.265',
						value: 'mov_h265',
					},
					{
						name: 'MOV ProRes KS',
						value: 'mov_proresks',
					},
					{
						name: 'MP4 H.264',
						value: 'mp4_h264',
					},
					{
						name: 'MP4 H.265',
						value: 'mp4_h265',
					},
					{
						name: 'WebM VP9',
						value: 'webm_vp9',
					},
				],
				default: 'mp4_h264',

			},
			{
				displayName: 'Preserve Audio',
				name: 'preserve_audio',
				type: 'boolean',
				default: true,
				description: 'Whether to preserve audio in the output video',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt.trim();

		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;
		if (!videoUrl || videoUrl.trim() === '') {
			throw new Error('Video URL is required');
		}
		params.video_url = videoUrl.trim();

		// 可选参数
		const outputContainerAndCodec = this.executeFunctions.getNodeParameter(
			'output_container_and_codec',
			this.itemIndex,
		) as string;
		if (outputContainerAndCodec) {
			params.output_container_and_codec = outputContainerAndCodec;
		}

		const preserveAudio = this.executeFunctions.getNodeParameter(
			'preserve_audio',
			this.itemIndex,
		) as boolean;
		if (preserveAudio !== undefined) {
			params.preserve_audio = preserveAudio;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Bria Video Eraser 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}

