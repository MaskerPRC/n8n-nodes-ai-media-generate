import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class TextToMusicV2Model extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'textToMusicV2',
			displayName: 'MiniMax Text To Music V2',
			endpoint: '/fal-ai/minimax-music/v2',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'audio',
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
					'A description of the music, specifying style, mood, and scenario. 10-300 characters.',
			},
			{
				displayName: 'Lyrics Prompt',
				name: 'lyrics_prompt',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				required: true,
				description:
					'Lyrics of the song. Use \\n to separate lines. You may add structure tags like [Intro], [Verse], [Chorus], [Bridge], [Outro] to enhance the arrangement. 10-3000 characters.',
			},
			{
				displayName: 'Audio Settings',
				name: 'audio_setting',
				type: 'fixedCollection',
				default: {},
				description: 'Audio configuration settings',
				options: [
					{
						name: 'audioSetting',
						displayName: 'Audio Setting',
						values: [
							{
								displayName: 'Sample Rate',
								name: 'sample_rate',
								type: 'options',
								options: [
									{
										name: '8000',
										value: '8000',
									},
									{
										name: '16000',
										value: '16000',
									},
									{
										name: '22050',
										value: '22050',
									},
									{
										name: '24000',
										value: '24000',
									},
									{
										name: '32000',
										value: '32000',
									},
									{
										name: '44100',
										value: '44100',
									},
								],
								default: '44100',
								description: 'Sample rate of generated audio',
							},
							{
								displayName: 'Bitrate',
								name: 'bitrate',
								type: 'options',
								options: [
									{
										name: '32000',
										value: '32000',
									},
									{
										name: '64000',
										value: '64000',
									},
									{
										name: '128000',
										value: '128000',
									},
									{
										name: '256000',
										value: '256000',
									},
								],
								default: '256000',
								description: 'Bitrate of generated audio',
							},
							{
								displayName: 'Format',
								name: 'format',
								type: 'options',
								options: [
									{
										name: 'MP3',
										value: 'mp3',
									},
									{
										name: 'PCM',
										value: 'pcm',
									},
									{
										name: 'FLAC',
										value: 'flac',
									},
								],
								default: 'mp3',
								description: 'Audio format',
							},
						],
					},
				],
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required and must be 10-300 characters');
		}
		if (prompt.length < 10 || prompt.length > 300) {
			throw new Error('Prompt must be between 10 and 300 characters');
		}
		params.prompt = prompt;

		// 必需参数：lyrics_prompt
		const lyricsPrompt = this.executeFunctions.getNodeParameter(
			'lyrics_prompt',
			this.itemIndex,
		) as string;
		if (!lyricsPrompt || lyricsPrompt.trim() === '') {
			throw new Error('Lyrics prompt is required and must be 10-3000 characters');
		}
		if (lyricsPrompt.length < 10 || lyricsPrompt.length > 3000) {
			throw new Error('Lyrics prompt must be between 10 and 3000 characters');
		}
		params.lyrics_prompt = lyricsPrompt;

		// 可选参数：audio_setting
		const audioSettingData = this.executeFunctions.getNodeParameter(
			'audio_setting',
			this.itemIndex,
		) as {
			audioSetting?: Array<{
				sample_rate?: string;
				bitrate?: string;
				format?: string;
			}>;
		};

		if (audioSettingData && audioSettingData.audioSetting && audioSettingData.audioSetting.length > 0) {
			const audioSetting = audioSettingData.audioSetting[0];
			const audioSettingObj: IDataObject = {};

			if (audioSetting.sample_rate) {
				audioSettingObj.sample_rate = audioSetting.sample_rate;
			}
			if (audioSetting.bitrate) {
				audioSettingObj.bitrate = audioSetting.bitrate;
			}
			if (audioSetting.format) {
				audioSettingObj.format = audioSetting.format;
			}

			// 只有当至少有一个设置项时才添加 audio_setting
			if (Object.keys(audioSettingObj).length > 0) {
				params.audio_setting = audioSettingObj;
			}
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Text To Music V2 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio）
		return response;
	}
}

