import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class KlingV26ProI2VModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'klingV26ProI2V',
			displayName: 'Kling V2.6 Pro Image-to-Video',
			endpoint: '/fal-ai/kling-video/v2.6/pro/image-to-video',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
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
					'The text prompt describing the desired video motion. For English speech, use lowercase letters; for acronyms or proper nouns, use uppercase.',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the image to be used for the video. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '5 Seconds',
						value: '5',
					},
					{
						name: '10 Seconds',
						value: '10',
					},
				],
				default: '5',
				description: 'The duration of the generated video in seconds',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negative_prompt',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: 'blur, distort, and low quality',
				description: 'Negative prompt to describe content to avoid',
			},
			{
				displayName: 'Generate Audio',
				name: 'generate_audio',
				type: 'boolean',
				default: true,
				description:
					'Whether to generate native audio for the video. Supports Chinese and English voice output. Other languages are automatically translated to English.',
			},
			{
				displayName: 'Voice IDs',
				name: 'voice_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of voice IDs to use for voice control. Reference voices in the prompt using &lt;&lt;&lt;voice_1&gt;&gt;&gt;, &lt;&lt;&lt;voice_2&gt;&gt;&gt;. Maximum 2 voices allowed. When provided and referenced in prompt, enables voice control billing.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		const imageUrl = this.executeFunctions.getNodeParameter('image_url', this.itemIndex) as string;
		if (!imageUrl) {
			throw new Error('Image URL is required');
		}
		params.image_url = imageUrl;

		// 可选参数
		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		const negativePrompt = this.executeFunctions.getNodeParameter(
			'negative_prompt',
			this.itemIndex,
		) as string;
		if (negativePrompt) {
			params.negative_prompt = negativePrompt;
		}

		const generateAudio = this.executeFunctions.getNodeParameter(
			'generate_audio',
			this.itemIndex,
		) as boolean;
		params.generate_audio = generateAudio;

		const voiceIds = this.executeFunctions.getNodeParameter('voice_ids', this.itemIndex) as string;
		if (voiceIds) {
			// 将逗号分隔的字符串转换为数组
			const voiceIdsArray = voiceIds
				.split(',')
				.map((id) => id.trim())
				.filter((id) => id.length > 0);
			if (voiceIdsArray.length > 0) {
				params.voice_ids = voiceIdsArray;
			}
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Kling V2.6 Pro I2V 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

