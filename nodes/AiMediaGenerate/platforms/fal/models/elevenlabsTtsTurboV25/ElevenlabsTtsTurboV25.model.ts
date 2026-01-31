import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class ElevenlabsTtsTurboV25Model extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'elevenlabsTtsTurboV25',
			displayName: 'ElevenLabs Turbo v2.5',
			endpoint: '/fal-ai/elevenlabs/tts/turbo-v2.5',
			syncEndpoint: '/fal-ai/elevenlabs/tts/turbo-v2.5/stream',
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
				description: 'The text to convert to speech',
			},
			{
				displayName: 'Voice',
				name: 'voice',
				type: 'string',
				default: 'Rachel',
				description: 'The voice to use for speech generation',
			},
			{
				displayName: 'Stability',
				name: 'stability',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.5,
				description: 'Voice stability (0-1). Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion.',
			},
			{
				displayName: 'Similarity Boost',
				name: 'similarity_boost',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.75,
				description: 'Similarity boost (0-1). Controls how closely the generated voice matches the original voice.',
			},
			{
				displayName: 'Style',
				name: 'style',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: '',
				description: 'Style exaggeration (0-1). Controls the expressiveness and style of the voice.',
			},
			{
				displayName: 'Speed',
				name: 'speed',
				type: 'number',
				typeOptions: {
					minValue: 0.7,
					maxValue: 1.2,
					numberStepSize: 0.1,
				},
				default: 1,
				description: 'Speech speed (0.7-1.2). Values below 1.0 slow down the speech, above 1.0 speed it up. Extreme values may affect quality.',
			},
			{
				displayName: 'Return Timestamps',
				name: 'timestamps',
				type: 'boolean',
				default: false,
				description: 'Whether to return timestamps for each word in the generated speech',
			},
			{
				displayName: 'Previous Text',
				name: 'previous_text',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description: 'The text that came before the text of the current request. Can be used to improve the speech\'s continuity when concatenating together multiple generations or to influence the speech\'s continuity in the current generation.',
			},
			{
				displayName: 'Next Text',
				name: 'next_text',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description: 'The text that comes after the text of the current request. Can be used to improve the speech\'s continuity when concatenating together multiple generations or to influence the speech\'s continuity in the current generation.',
			},
			{
				displayName: 'Language Code',
				name: 'language_code',
				type: 'string',
				default: '',
				description: 'Language code (ISO 639-1) used to enforce a language for the model. An error will be returned if language code is not supported by the model.',
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

		// 可选参数：voice
		const voice = this.executeFunctions.getNodeParameter('voice', this.itemIndex) as string;
		if (voice) {
			params.voice = voice;
		}

		// 可选参数：stability
		const stability = this.executeFunctions.getNodeParameter('stability', this.itemIndex) as
			| number
			| undefined;
		if (stability !== undefined && stability !== null) {
			params.stability = stability;
		}

		// 可选参数：similarity_boost
		const similarityBoost = this.executeFunctions.getNodeParameter(
			'similarity_boost',
			this.itemIndex,
		) as number | undefined;
		if (similarityBoost !== undefined && similarityBoost !== null) {
			params.similarity_boost = similarityBoost;
		}

		// 可选参数：style
		const style = this.executeFunctions.getNodeParameter('style', this.itemIndex) as
			| number
			| string
			| undefined;
		if (style !== undefined && style !== null && style !== '') {
			params.style = typeof style === 'number' ? style : parseFloat(style as string);
		}

		// 可选参数：speed
		const speed = this.executeFunctions.getNodeParameter('speed', this.itemIndex) as
			| number
			| undefined;
		if (speed !== undefined && speed !== null) {
			params.speed = speed;
		}

		// 可选参数：timestamps
		const timestamps = this.executeFunctions.getNodeParameter('timestamps', this.itemIndex) as
			| boolean
			| undefined;
		if (timestamps !== undefined && timestamps !== null) {
			params.timestamps = timestamps;
		}

		// 可选参数：previous_text
		const previousText = this.executeFunctions.getNodeParameter('previous_text', this.itemIndex) as
			| string
			| undefined;
		if (previousText && previousText.trim() !== '') {
			params.previous_text = previousText;
		}

		// 可选参数：next_text
		const nextText = this.executeFunctions.getNodeParameter('next_text', this.itemIndex) as
			| string
			| undefined;
		if (nextText && nextText.trim() !== '') {
			params.next_text = nextText;
		}

		// 可选参数：language_code
		const languageCode = this.executeFunctions.getNodeParameter('language_code', this.itemIndex) as
			| string
			| undefined;
		if (languageCode && languageCode.trim() !== '') {
			params.language_code = languageCode;
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


