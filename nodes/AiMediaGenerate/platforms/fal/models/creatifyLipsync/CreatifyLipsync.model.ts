import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class CreatifyLipsyncModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'creatifyLipsync',
			displayName: 'Creatify Lipsync',
			endpoint: '/creatify/lipsync',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'The audio URL to use for lipsync. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Video URL',
				name: 'video_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'The video URL to use for lipsync. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Loop',
				name: 'loop',
				type: 'boolean',
				default: true,
				description: 'Whether to loop the video',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：audio_url
		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		if (!audioUrl || audioUrl.trim() === '') {
			throw new Error('Audio URL is required');
		}
		params.audio_url = audioUrl.trim();

		// 必需参数：video_url
		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;
		if (!videoUrl || videoUrl.trim() === '') {
			throw new Error('Video URL is required');
		}
		params.video_url = videoUrl.trim();

		// 可选参数：loop
		const loop = this.executeFunctions.getNodeParameter('loop', this.itemIndex) as boolean;
		if (loop !== undefined && loop !== null) {
			params.loop = loop;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Creatify Lipsync 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}


