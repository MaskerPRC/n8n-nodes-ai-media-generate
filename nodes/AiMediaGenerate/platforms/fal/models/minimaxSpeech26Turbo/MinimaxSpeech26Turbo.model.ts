import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class MinimaxSpeech26TurboModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'minimaxSpeech26Turbo',
			displayName: 'MiniMax Text To Speech 2.6 Turbo',
			endpoint: '/fal-ai/minimax/speech-2.6-turbo',
			syncEndpoint: '/fal-ai/minimax/speech-2.6-turbo/stream',
			supportsSync: true,
			supportsAsync: true,
			modelType: 'video', // 使用 video 类型的超时时间，因为音频生成可能需要较长时间
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
				description: 'Text to convert to speech. Paragraph breaks should be marked with newline characters. NOTE: You can customize speech pauses by adding markers in the form &lt;#x#&gt;, where x is the pause duration in seconds. Valid range: [0.01, 99.99], up to two decimal places. Pause markers must be placed between speakable text segments and cannot be used consecutively.',
			},
			{
				displayName: 'Voice Setting',
				name: 'voice_setting',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				description: 'Voice configuration settings',
				options: [
					{
						displayName: 'Voice Setting',
						name: 'values',
						values: [
							{
						displayName: 'Emotion',
						name: 'emotion',
						type: 'options',
						options: [
									{
										name: 'Angry',
										value: 'angry',
									},
									{
										name: 'Disgusted',
										value: 'disgusted',
									},
									{
										name: 'Fearful',
										value: 'fearful',
									},
									{
										name: 'Happy',
										value: 'happy',
									},
									{
										name: 'Neutral',
										value: 'neutral',
									},
									{
										name: 'Sad',
										value: 'sad',
									},
									{
										name: 'Surprised',
										value: 'surprised',
									},
								],
						default: 'happy',
						description: 'Emotion of the generated speech',
							},
							{
						displayName: 'English Normalization',
						name: 'english_normalization',
						type: 'boolean',
						default: false,
						description: 'Whether to enable English text normalization to improve number reading performance, with a slight increase in latency',
							},
							{
						displayName: 'Pitch',
						name: 'pitch',
						type: 'number',
						default: 0,
						description: 'Voice pitch (-12 to 12)',
							},
							{
						displayName: 'Speed',
						name: 'speed',
						type: 'number',
						default: 1,
						description: 'Speech speed (0.5-2.0)',
							},
							{
						displayName: 'Voice ID',
						name: 'voice_id',
						type: 'string',
						default: 'Wise_Woman',
						description: 'Predefined voice ID to use for synthesis',
							},
							{
						displayName: 'Volume',
						name: 'vol',
						type: 'number',
						default: 1,
						description: 'Volume (0-10)',
							},
					],
					},
				],
			},
			{
				displayName: 'Audio Setting',
				name: 'audio_setting',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				description: 'Audio configuration settings',
				options: [
					{
						displayName: 'Audio Setting',
						name: 'values',
						values: [
							{
								displayName: 'Sample Rate',
								name: 'sample_rate',
								type: 'options',
								options: [
									{ name: '8000', value: '8000' },
									{ name: '16000', value: '16000' },
									{ name: '22050', value: '22050' },
									{ name: '24000', value: '24000' },
									{ name: '32000', value: '32000' },
									{ name: '44100', value: '44100' },
								],
								default: '32000',
								description: 'Sample rate of generated audio',
							},
							{
								displayName: 'Bitrate',
								name: 'bitrate',
								type: 'options',
								options: [
									{ name: '32000', value: '32000' },
									{ name: '64000', value: '64000' },
									{ name: '128000', value: '128000' },
									{ name: '256000', value: '256000' },
								],
								default: '128000',
								description: 'Bitrate of generated audio',
							},
							{
								displayName: 'Format',
								name: 'format',
								type: 'options',
								options: [
									{ name: 'MP3', value: 'mp3' },
									{ name: 'PCM', value: 'pcm' },
									{ name: 'FLAC', value: 'flac' },
								],
								default: 'mp3',
								description: 'Audio format',
							},
							{
								displayName: 'Channel',
								name: 'channel',
								type: 'options',
								options: [
									{ name: 'Mono (1)', value: '1' },
									{ name: 'Stereo (2)', value: '2' },
								],
								default: '1',
								description: 'Number of audio channels (1=mono, 2=stereo)',
							},
						],
					},
				],
			},
			{
				displayName: 'Language Boost',
				name: 'language_boost',
				type: 'options',
				options: [
					{ name: 'Afrikaans', value: 'Afrikaans' },
					{ name: 'Arabic', value: 'Arabic' },
					{ name: 'Auto', value: 'auto' },
					{ name: 'Bulgarian', value: 'Bulgarian' },
					{ name: 'Catalan', value: 'Catalan' },
					{ name: 'Chinese', value: 'Chinese' },
					{ name: 'Chinese, Yue', value: 'Chinese,Yue' },
					{ name: 'Croatian', value: 'Croatian' },
					{ name: 'Czech', value: 'Czech' },
					{ name: 'Danish', value: 'Danish' },
					{ name: 'Dutch', value: 'Dutch' },
					{ name: 'English', value: 'English' },
					{ name: 'Finnish', value: 'Finnish' },
					{ name: 'French', value: 'French' },
					{ name: 'German', value: 'German' },
					{ name: 'Greek', value: 'Greek' },
					{ name: 'Hebrew', value: 'Hebrew' },
					{ name: 'Hindi', value: 'Hindi' },
					{ name: 'Hungarian', value: 'Hungarian' },
					{ name: 'Indonesian', value: 'Indonesian' },
					{ name: 'Italian', value: 'Italian' },
					{ name: 'Japanese', value: 'Japanese' },
					{ name: 'Korean', value: 'Korean' },
					{ name: 'Malay', value: 'Malay' },
					{ name: 'Norwegian', value: 'Norwegian' },
					{ name: 'Nynorsk', value: 'Nynorsk' },
					{ name: 'Polish', value: 'Polish' },
					{ name: 'Portuguese', value: 'Portuguese' },
					{ name: 'Romanian', value: 'Romanian' },
					{ name: 'Russian', value: 'Russian' },
					{ name: 'Slovak', value: 'Slovak' },
					{ name: 'Slovenian', value: 'Slovenian' },
					{ name: 'Spanish', value: 'Spanish' },
					{ name: 'Swedish', value: 'Swedish' },
					{ name: 'Thai', value: 'Thai' },
					{ name: 'Turkish', value: 'Turkish' },
					{ name: 'Ukrainian', value: 'Ukrainian' },
					{ name: 'Vietnamese', value: 'Vietnamese' },
				],
				default: 'auto',
				description: 'Enhance recognition of specified languages and dialects',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'Hex', value: 'hex' },
				],
				default: 'hex',
				description: 'Format of the output content (non-streaming only)',
			},
			{
				displayName: 'Pronunciation Dict',
				name: 'pronunciation_dict',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				description:
					'Custom pronunciation dictionary for text replacement. For Chinese, tones are 1-5. Example: ["燕少飞/(yan4)(shao3)(fei1)"]',
				options: [
					{
						displayName: 'Pronunciation Dict',
						name: 'values',
						values: [
							{
								displayName: 'Tone List',
								name: 'tone_list',
								type: 'string',
								typeOptions: {
									rows: 3,
								},
								default: '',
								description: 'List of pronunciation replacements in format ["text/(pronunciation)", ...]. Enter as JSON array string, e.g. ["燕少飞/(yan4)(shao3)(fei1)"].',
							},
						],
					},
				],
			},
			{
				displayName: 'Normalization Setting',
				name: 'normalization_setting',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				description: 'Loudness normalization settings for the audio',
				options: [
					{
						displayName: 'Normalization Setting',
						name: 'values',
						values: [
							{
								displayName: 'Enabled',
								name: 'enabled',
								type: 'boolean',
								default: true,
								description: 'Whether to enable loudness normalization for the audio',
							},
							{
								displayName: 'Target Loudness',
								name: 'target_loudness',
								type: 'number',
								typeOptions: {
									numberStepSize: 0.1,
								},
								default: -18.0,
								description: 'Target loudness in LUFS (default -18.0)',
							},
							{
								displayName: 'Target Range',
								name: 'target_range',
								type: 'number',
								typeOptions: {
									numberStepSize: 0.1,
								},
								default: 8.0,
								description: 'Target loudness range in LU (default 8.0)',
							},
							{
								displayName: 'Target Peak',
								name: 'target_peak',
								type: 'number',
								typeOptions: {
									numberStepSize: 0.1,
								},
								default: -0.5,
								description: 'Target peak level in dBTP (default -0.5)',
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
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		// 可选参数：voice_setting
		const voiceSetting = this.executeFunctions.getNodeParameter(
			'voice_setting',
			this.itemIndex,
		) as IDataObject | undefined;
		if (voiceSetting && voiceSetting.values) {
			const voiceValues = voiceSetting.values as IDataObject;
			const voiceSettingObj: IDataObject = {};

			if (voiceValues.voice_id) {
				voiceSettingObj.voice_id = voiceValues.voice_id;
			}
			if (voiceValues.speed !== undefined && voiceValues.speed !== null) {
				voiceSettingObj.speed = voiceValues.speed;
			}
			if (voiceValues.vol !== undefined && voiceValues.vol !== null) {
				voiceSettingObj.vol = voiceValues.vol;
			}
			if (voiceValues.pitch !== undefined && voiceValues.pitch !== null) {
				voiceSettingObj.pitch = voiceValues.pitch;
			}
			if (voiceValues.emotion) {
				voiceSettingObj.emotion = voiceValues.emotion;
			}
			if (voiceValues.english_normalization !== undefined) {
				voiceSettingObj.english_normalization = voiceValues.english_normalization;
			}

			if (Object.keys(voiceSettingObj).length > 0) {
				params.voice_setting = voiceSettingObj;
			}
		}

		// 可选参数：audio_setting
		const audioSetting = this.executeFunctions.getNodeParameter(
			'audio_setting',
			this.itemIndex,
		) as IDataObject | undefined;
		if (audioSetting && audioSetting.values) {
			const audioValues = audioSetting.values as IDataObject;
			const audioSettingObj: IDataObject = {};

			if (audioValues.sample_rate) {
				audioSettingObj.sample_rate = audioValues.sample_rate;
			}
			if (audioValues.bitrate) {
				audioSettingObj.bitrate = audioValues.bitrate;
			}
			if (audioValues.format) {
				audioSettingObj.format = audioValues.format;
			}
			if (audioValues.channel) {
				audioSettingObj.channel = audioValues.channel;
			}

			if (Object.keys(audioSettingObj).length > 0) {
				params.audio_setting = audioSettingObj;
			}
		}

		// 可选参数：language_boost
		const languageBoost = this.executeFunctions.getNodeParameter(
			'language_boost',
			this.itemIndex,
		) as string | undefined;
		if (languageBoost && languageBoost !== 'auto') {
			params.language_boost = languageBoost;
		}

		// 可选参数：output_format
		const outputFormat = this.executeFunctions.getNodeParameter(
			'output_format',
			this.itemIndex,
		) as string | undefined;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		// 可选参数：pronunciation_dict
		const pronunciationDict = this.executeFunctions.getNodeParameter(
			'pronunciation_dict',
			this.itemIndex,
		) as IDataObject | undefined;
		if (pronunciationDict && pronunciationDict.values) {
			const dictValues = pronunciationDict.values as IDataObject;
			if (dictValues.tone_list) {
				try {
					// 尝试解析 JSON 字符串
					const toneList =
						typeof dictValues.tone_list === 'string'
							? JSON.parse(dictValues.tone_list)
							: dictValues.tone_list;
					if (Array.isArray(toneList) && toneList.length > 0) {
						params.pronunciation_dict = {
							tone_list: toneList,
						};
					}
				} catch {
					// 如果解析失败，忽略该参数
					// 错误已被捕获，不记录日志以避免类型错误
				}
			}
		}

		// 可选参数：normalization_setting
		const normalizationSetting = this.executeFunctions.getNodeParameter(
			'normalization_setting',
			this.itemIndex,
		) as IDataObject | undefined;
		if (normalizationSetting && normalizationSetting.values) {
			const normValues = normalizationSetting.values as IDataObject;
			const normalizationObj: IDataObject = {};

			if (normValues.enabled !== undefined) {
				normalizationObj.enabled = normValues.enabled;
			}
			if (normValues.target_loudness !== undefined && normValues.target_loudness !== null) {
				normalizationObj.target_loudness = normValues.target_loudness;
			}
			if (normValues.target_range !== undefined && normValues.target_range !== null) {
				normalizationObj.target_range = normValues.target_range;
			}
			if (normValues.target_peak !== undefined && normValues.target_peak !== null) {
				normalizationObj.target_peak = normValues.target_peak;
			}

			if (Object.keys(normalizationObj).length > 0) {
				params.normalization_setting = normalizationObj;
			}
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio 和 duration_ms）
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio 和 duration_ms）
		return response;
	}
}

