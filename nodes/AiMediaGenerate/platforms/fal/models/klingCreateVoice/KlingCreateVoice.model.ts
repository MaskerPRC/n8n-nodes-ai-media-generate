import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class KlingCreateVoiceModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'klingCreateVoice',
			displayName: 'Kling Create Voice',
			endpoint: '/fal-ai/kling-video/create-voice',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'audio', // 创建语音功能，使用音频类型
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Voice URL',
				name: 'voice_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the voice audio file. Supports .mp3/.wav audio or .mp4/.mov video. Duration must be 5-30 seconds with clean, single-voice audio.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：voice_url
		const voiceUrl = this.executeFunctions.getNodeParameter('voice_url', this.itemIndex) as string;
		if (!voiceUrl || voiceUrl.trim() === '') {
			throw new Error('Voice URL is required');
		}
		params.voice_url = voiceUrl.trim();

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 此模型不支持同步响应
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 返回原始响应，包含 voice_id
		return response;
	}
}


