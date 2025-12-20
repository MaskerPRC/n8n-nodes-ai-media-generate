import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class MinimaxVoiceCloneModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'minimaxVoiceClone',
			displayName: 'MiniMax Voice Clone',
			endpoint: '/fal-ai/minimax/voice-clone',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video', // 使用 video 类型的超时时间，因为语音克隆可能需要较长时间
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
					'URL of the input audio file for voice cloning. Should be at least 10 seconds long. To retain the voice permanently, use it with a TTS (text-to-speech) endpoint at least once within 7 days. Otherwise, it will be automatically deleted.',
			},
			{
				displayName: 'Noise Reduction',
				name: 'noise_reduction',
				type: 'boolean',
				default: false,
				description: 'Whether to enable noise reduction for the cloned voice',
			},
			{
				displayName: 'Volume Normalization',
				name: 'need_volume_normalization',
				type: 'boolean',
				default: false,
				description: 'Whether to enable volume normalization for the cloned voice',
			},
			{
				displayName: 'Accuracy',
				name: 'accuracy',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.01,
				},
				default: '',
				description: 'Text validation accuracy threshold (0-1)',
			},
			{
				displayName: 'Preview Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Hello, this is a preview of your cloned voice! I hope you like it!',
				description:
					'Text to generate a TTS preview with the cloned voice (optional). If provided, a preview audio will be generated.',
			},
			{
				displayName: 'TTS Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'Speech 02 HD',
						value: 'speech-02-hd',
					},
					{
						name: 'Speech 02 Turbo',
						value: 'speech-02-turbo',
					},
					{
						name: 'Speech 01 HD',
						value: 'speech-01-hd',
					},
					{
						name: 'Speech 01 Turbo',
						value: 'speech-01-turbo',
					},
				],
				default: 'speech-02-hd',
				description: 'TTS model to use for preview',
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

		// 可选参数：noise_reduction
		const noiseReduction = this.executeFunctions.getNodeParameter(
			'noise_reduction',
			this.itemIndex,
		) as boolean | undefined;
		if (noiseReduction !== undefined && noiseReduction !== null) {
			params.noise_reduction = noiseReduction;
		}

		// 可选参数：need_volume_normalization
		const volumeNormalization = this.executeFunctions.getNodeParameter(
			'need_volume_normalization',
			this.itemIndex,
		) as boolean | undefined;
		if (volumeNormalization !== undefined && volumeNormalization !== null) {
			params.need_volume_normalization = volumeNormalization;
		}

		// 可选参数：accuracy
		const accuracy = this.executeFunctions.getNodeParameter('accuracy', this.itemIndex) as
			| number
			| string
			| undefined;
		if (accuracy !== undefined && accuracy !== null && accuracy !== '') {
			params.accuracy = typeof accuracy === 'number' ? accuracy : parseFloat(accuracy as string);
		}

		// 可选参数：text
		const text = this.executeFunctions.getNodeParameter('text', this.itemIndex) as
			| string
			| undefined;
		if (text && text.trim() !== '') {
			params.text = text.trim();
		}

		// 可选参数：model
		const model = this.executeFunctions.getNodeParameter('model', this.itemIndex) as
			| string
			| undefined;
		if (model && model.trim() !== '') {
			params.model = model;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 此模型不支持同步响应
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 返回原始响应，包含 custom_voice_id 和 audio（如果请求了预览）
		return response;
	}
}

