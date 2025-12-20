import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class VeedLipsyncModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veedLipsync',
			displayName: 'VEED Lipsync',
			endpoint: '/veed/lipsync',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Video URL',
				name: 'video_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the video to sync. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the audio to sync with the video. Must be publicly accessible or base64 data URI.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：video_url
		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;
		if (!videoUrl || videoUrl.trim() === '') {
			throw new Error('Video URL is required');
		}
		params.video_url = videoUrl.trim();

		// 必需参数：audio_url
		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		if (!audioUrl || audioUrl.trim() === '') {
			throw new Error('Audio URL is required');
		}
		params.audio_url = audioUrl.trim();

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// VEED Lipsync 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}

