import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class ElevenLabsSoundEffectsV2Model extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'elevenLabsSoundEffectsV2',
			displayName: 'ElevenLabs Sound Effects V2',
			endpoint: '/fal-ai/elevenlabs/sound-effects/v2',
			syncEndpoint: '/fal-ai/elevenlabs/sound-effects/v2/stream', // 同步接口使用 stream 端点
			supportsSync: true,
			supportsAsync: true,
			modelType: 'video', // 使用 video 类型的超时时间，因为音频生成可能需要较长时间
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The text describing the sound effect to generate',
			},
			{
				displayName: 'Duration (Seconds)',
				name: 'duration_seconds',
				type: 'number',
				typeOptions: {
					minValue: 0.5,
					maxValue: 22,
					numberStepSize: 0.1,
				},
				default: '',
				description:
					'Duration in seconds (0.5-22). If not specified, optimal duration will be determined from prompt.',
			},
			{
				displayName: 'Prompt Influence',
				name: 'prompt_influence',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.3,
				description:
					'How closely to follow the prompt (0-1). Higher values mean less variation. Default: 0.3',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{
						name: 'A-Law 8000Hz',
						value: 'alaw_8000',
					},
					{
						name: 'MP3 22050Hz 32kbps',
						value: 'mp3_22050_32',
					},
					{
						name: 'MP3 44100Hz 128kbps',
						value: 'mp3_44100_128',
					},
					{
						name: 'MP3 44100Hz 192kbps',
						value: 'mp3_44100_192',
					},
					{
						name: 'MP3 44100Hz 32kbps',
						value: 'mp3_44100_32',
					},
					{
						name: 'MP3 44100Hz 64kbps',
						value: 'mp3_44100_64',
					},
					{
						name: 'MP3 44100Hz 96kbps',
						value: 'mp3_44100_96',
					},
					{
						name: 'Opus 48000Hz 128kbps',
						value: 'opus_48000_128',
					},
					{
						name: 'Opus 48000Hz 192kbps',
						value: 'opus_48000_192',
					},
					{
						name: 'Opus 48000Hz 32kbps',
						value: 'opus_48000_32',
					},
					{
						name: 'Opus 48000Hz 64kbps',
						value: 'opus_48000_64',
					},
					{
						name: 'Opus 48000Hz 96kbps',
						value: 'opus_48000_96',
					},
					{
						name: 'PCM 16000Hz',
						value: 'pcm_16000',
					},
					{
						name: 'PCM 22050Hz',
						value: 'pcm_22050',
					},
					{
						name: 'PCM 24000Hz',
						value: 'pcm_24000',
					},
					{
						name: 'PCM 44100Hz',
						value: 'pcm_44100',
					},
					{
						name: 'PCM 48000Hz',
						value: 'pcm_48000',
					},
					{
						name: 'PCM 8000Hz',
						value: 'pcm_8000',
					},
					{
						name: 'μ-Law 8000Hz',
						value: 'ulaw_8000',
					},
				],
				default: 'mp3_44100_128',
				description:
					'Output format of the generated audio. Formatted as codec_sample_rate_bitrate. Default: mp3_44100_128',
			},
			{
				displayName: 'Loop',
				name: 'loop',
				type: 'boolean',
				default: false,
				description: 'Whether to create a sound effect that loops smoothly',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：text
		const text = this.executeFunctions.getNodeParameter('text', this.itemIndex) as string;
		if (!text) {
			throw new Error('Text is required');
		}
		params.text = text;

		// 可选参数：duration_seconds
		const durationSeconds = this.executeFunctions.getNodeParameter(
			'duration_seconds',
			this.itemIndex,
		) as number | string | undefined;
		if (durationSeconds !== undefined && durationSeconds !== null && durationSeconds !== '') {
			params.duration_seconds =
				typeof durationSeconds === 'number'
					? durationSeconds
					: parseFloat(durationSeconds as string);
		}

		// 可选参数：prompt_influence
		const promptInfluence = this.executeFunctions.getNodeParameter(
			'prompt_influence',
			this.itemIndex,
		) as number | undefined;
		if (promptInfluence !== undefined && promptInfluence !== null) {
			params.prompt_influence = promptInfluence;
		}

		// 可选参数：output_format
		const outputFormat = this.executeFunctions.getNodeParameter(
			'output_format',
			this.itemIndex,
		) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		// 可选参数：loop
		const loop = this.executeFunctions.getNodeParameter('loop', this.itemIndex) as boolean | undefined;
		if (loop !== undefined && loop !== null) {
			params.loop = loop;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio）
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio）
		return response;
	}
}

