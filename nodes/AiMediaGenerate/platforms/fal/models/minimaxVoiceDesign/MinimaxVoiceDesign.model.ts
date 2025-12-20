import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class MinimaxVoiceDesignModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'minimaxVoiceDesign',
			displayName: 'MiniMax Voice Design',
			endpoint: '/fal-ai/minimax/voice-design',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video', // 使用 video 类型的超时时间，因为语音生成可能需要较长时间
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
				description: 'Voice description prompt for generating a personalized voice',
			},
			{
				displayName: 'Preview Text',
				name: 'preview_text',
				type: 'string',
				typeOptions: {
					rows: 4,
					maxLength: 500,
				},
				default: '',
				required: true,
				description: 'Text for audio preview. Limited to 500 characters. A fee of $30 per 1M characters will be charged for the generation of the preview audio.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt.trim();

		// 必需参数：preview_text
		const previewText = this.executeFunctions.getNodeParameter(
			'preview_text',
			this.itemIndex,
		) as string;
		if (!previewText || previewText.trim() === '') {
			throw new Error('Preview text is required');
		}
		const trimmedPreviewText = previewText.trim();
		if (trimmedPreviewText.length > 500) {
			throw new Error('Preview text must be limited to 500 characters');
		}
		params.preview_text = trimmedPreviewText;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 此模型不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 custom_voice_id 和 audio）
		return response;
	}
}

