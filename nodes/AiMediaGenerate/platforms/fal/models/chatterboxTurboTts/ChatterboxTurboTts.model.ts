import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class ChatterboxTurboTtsModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'chatterboxTurboTts',
			displayName: 'Chatterbox Turbo TTS',
			endpoint: '/fal-ai/chatterbox/text-to-speech/turbo',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'audio',
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
				description: 'The text to be converted to speech. You can add paralinguistic tags: [clear throat], [sigh], [shush], [cough], [groan], [sniff], [gasp], [chuckle], [laugh].',
			},
			{
				displayName: 'Voice',
				name: 'voice',
				type: 'string',
				default: 'lucy',
				description:
					'Preset voice to use for synthesis. Choose from available voices or provide a custom audio URL.',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				description:
					'Optional URL to a custom audio file (5-10 seconds) for voice cloning. If provided, this overrides the preset voice selection.',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberStepSize: 0.1,
				},
				default: 0.8,
				description:
					'Temperature for generation. Higher values create more varied speech patterns.',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: 0,
				description:
					'Random seed for reproducible results. Set to 0 for random generation.',
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
		if (voice && voice.trim() !== '') {
			params.voice = voice;
		}

		// 可选参数：audio_url
		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as
			| string
			| undefined;
		if (audioUrl && audioUrl.trim() !== '') {
			params.audio_url = audioUrl;
		}

		// 可选参数：temperature
		const temperature = this.executeFunctions.getNodeParameter('temperature', this.itemIndex) as
			| number
			| undefined;
		if (temperature !== undefined && temperature !== null) {
			params.temperature = temperature;
		}

		// 可选参数：seed
		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as
			| number
			| string
			| undefined;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
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

