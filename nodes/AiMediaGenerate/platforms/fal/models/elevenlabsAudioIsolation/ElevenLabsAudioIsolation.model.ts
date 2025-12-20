import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class ElevenLabsAudioIsolationModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'elevenlabsAudioIsolation',
			displayName: 'ElevenLabs Audio Isolation',
			endpoint: '/fal-ai/elevenlabs/audio-isolation',
			supportsSync: true,
			supportsAsync: true,
			modelType: 'video', // 使用 video 类型的超时时间，因为音频处理可能需要较长时间
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				description: 'URL of the audio file to isolate voice from. Either audio_url or video_url must be provided.',
			},
			{
				displayName: 'Video URL',
				name: 'video_url',
				type: 'string',
				default: '',
				description: 'Video file to use for audio isolation. Either audio_url or video_url must be provided.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：audio_url 或 video_url（必须提供一个）
		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;

		if (!audioUrl && !videoUrl) {
			throw new Error('Either audio_url or video_url must be provided');
		}

		if (audioUrl && videoUrl) {
			throw new Error('Only one of audio_url or video_url should be provided, not both');
		}

		if (audioUrl && audioUrl.trim() !== '') {
			params.audio_url = audioUrl.trim();
		}

		if (videoUrl && videoUrl.trim() !== '') {
			params.video_url = videoUrl.trim();
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio 和 timestamps）
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio 和 timestamps）
		return response;
	}
}

