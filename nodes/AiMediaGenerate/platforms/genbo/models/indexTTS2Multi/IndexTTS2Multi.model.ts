import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseGenboModel } from '../../shared/baseGenboModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class IndexTTS2MultiModel extends BaseGenboModel {
	getConfig(): ModelConfig {
		return {
			name: 'indexTTS2Multi',
			displayName: 'IndexTTS2 Multi',
			endpoint: '/v1/audio/generations',
			supportsSync: false,
			supportsAsync: true,
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
				description: 'The dialogue text prompt with speaker tags, e.g., [s1] Speaker 1 text\n[s2] Speaker 2 text',
			},
			{
				displayName: 'Prompt 2',
				name: 'prompt_2',
				type: 'string',
				default: '',
				description: 'Additional emotion prompt for the first speaker',
			},
			{
				displayName: 'Prompt 3',
				name: 'prompt_3',
				type: 'string',
				default: '',
				description: 'Additional emotion prompt for the second speaker',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				description: 'URL of the reference audio file for the first speaker',
			},
			{
				displayName: 'Audio URL 2',
				name: 'audio_url_2',
				type: 'string',
				default: '',
				description: 'URL of the reference audio file for the second speaker',
			},
			{
				displayName: 'Emotion Alpha',
				name: 'emo_alpha',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 1,
				description: 'Emotion control parameter for the first speaker (0-1)',
			},
			{
				displayName: 'Emotion Alpha S2',
				name: 'emo_alpha_s2',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 1,
				description: 'Emotion control parameter for the second speaker (0-1)',
			},
			{
				displayName: 'Max Length',
				name: 'max_length',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1500,
				description: 'Maximum length of the generated audio',
			},
			{
				displayName: 'Use Random',
				name: 'use_random',
				type: 'boolean',
				default: false,
				description: 'Whether to use random generation for the first speaker',
			},
			{
				displayName: 'Use Random S2',
				name: 'use_random_s2',
				type: 'boolean',
				default: false,
				description: 'Whether to use random generation for the second speaker',
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
				description: 'Temperature parameter for generation (0-2)',
			},
			{
				displayName: 'Unload Model',
				name: 'unload_model',
				type: 'boolean',
				default: false,
				description: 'Whether to unload the model after generation',
			},
			{
				displayName: 'Use Emo Text',
				name: 'use_emo_text',
				type: 'boolean',
				default: true,
				description: 'Whether to use emotion text',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {
			model: 'IndexTTS2 Multi',
		};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		// 可选参数
		const prompt2 = this.executeFunctions.getNodeParameter('prompt_2', this.itemIndex) as string;
		if (prompt2) {
			params.prompt_2 = prompt2;
		}

		const prompt3 = this.executeFunctions.getNodeParameter('prompt_3', this.itemIndex) as string;
		if (prompt3) {
			params.prompt_3 = prompt3;
		}

		const audioUrl = this.executeFunctions.getNodeParameter('audio_url', this.itemIndex) as string;
		if (audioUrl) {
			params.audio_url = audioUrl;
		}

		const audioUrl2 = this.executeFunctions.getNodeParameter('audio_url_2', this.itemIndex) as string;
		if (audioUrl2) {
			params.audio_url_2 = audioUrl2;
		}

		const emoAlpha = this.executeFunctions.getNodeParameter('emo_alpha', this.itemIndex) as number;
		if (emoAlpha !== undefined && emoAlpha !== null) {
			params.emo_alpha = emoAlpha;
		}

		const emoAlphaS2 = this.executeFunctions.getNodeParameter('emo_alpha_s2', this.itemIndex) as number;
		if (emoAlphaS2 !== undefined && emoAlphaS2 !== null) {
			params.emo_alpha_s2 = emoAlphaS2;
		}

		const maxLength = this.executeFunctions.getNodeParameter('max_length', this.itemIndex) as number;
		if (maxLength !== undefined && maxLength !== null) {
			params.max_length = maxLength;
		}

		const useRandom = this.executeFunctions.getNodeParameter('use_random', this.itemIndex) as boolean;
		if (useRandom !== undefined && useRandom !== null) {
			params.use_random = useRandom;
		}

		const useRandomS2 = this.executeFunctions.getNodeParameter('use_random_s2', this.itemIndex) as boolean;
		if (useRandomS2 !== undefined && useRandomS2 !== null) {
			params.use_random_s2 = useRandomS2;
		}

		const temperature = this.executeFunctions.getNodeParameter('temperature', this.itemIndex) as number;
		if (temperature !== undefined && temperature !== null) {
			params.temperature = temperature;
		}

		const unloadModel = this.executeFunctions.getNodeParameter('unload_model', this.itemIndex) as boolean;
		if (unloadModel !== undefined && unloadModel !== null) {
			params.unload_model = unloadModel;
		}

		const useEmoText = this.executeFunctions.getNodeParameter('use_emo_text', this.itemIndex) as boolean;
		if (useEmoText !== undefined && useEmoText !== null) {
			params.use_emo_text = useEmoText;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// IndexTTS2 Multi 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 处理异步响应，提取音频 URL
		const result: IDataObject = {
			task_id: response.task_id,
			task_status: response.task_status,
			created_at: response.created_at,
			updated_at: response.updated_at,
		};

		// 提取失败原因（如果有）
		if (response.fail_reason) {
			result.fail_reason = response.fail_reason;
		}

		// 提取任务结果
		if (response.task_result) {
			const taskResult = response.task_result as IDataObject;
			result.task_result = taskResult;
			
			// 如果存在 URL，直接提取到顶层以便于访问
			if (taskResult.url) {
				result.audio_url = taskResult.url;
			}
		}

		// 提取输入参数（如果有）
		if (response.input) {
			result.input = response.input;
		}

		return result;
	}
}

