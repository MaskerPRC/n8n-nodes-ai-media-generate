import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Veo31ReferenceToVideoModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veo31ReferenceToVideo',
			displayName: 'Veo 3.1 Reference-to-Video',
			endpoint: '/fal-ai/veo3.1/reference-to-video',
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
					'The prompt should describe how to animate between the first and last frame. Include: Action (how the first and last frame should be animated), Style (desired animation style), Camera motion (optional, how camera should move), Ambiance (optional, desired mood and atmosphere).',
			},
			{
				displayName: 'Image URLs',
				name: 'image_urls',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Image URL',
				},
				default: [],
				required: true,
				description:
					'URLs of the reference images to use for consistent subject appearance. Input images up to 8MB in size. Can be publicly accessible URLs or base64 data URIs.',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '8 Seconds',
						value: '8s',
					},
				],
				default: '8s',
				description: 'The duration of the generated video',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '720p',
						value: '720p',
					},
					{
						name: '1080p',
						value: '1080p',
					},
				],
				default: '720p',
				description: 'The resolution of the generated video',
			},
			{
				displayName: 'Generate Audio',
				name: 'generate_audio',
				type: 'boolean',
				default: true,
				description: 'Whether to generate audio for the video',
			},
			{
				displayName: 'Auto Fix',
				name: 'auto_fix',
				type: 'boolean',
				default: false,
				description:
					'Whether to automatically attempt to fix prompts that fail content policy or other validation checks by rewriting them',
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

		// 处理 image_urls
		const imageUrls = this.executeFunctions.getNodeParameter('image_urls', this.itemIndex);
		if (!imageUrls) {
			throw new Error('At least one image URL is required');
		}

		// 处理多种输入格式
		let processedUrls: string[] = [];
		if (Array.isArray(imageUrls)) {
			// n8n 的 multipleValues 可能返回对象数组或字符串数组
			processedUrls = imageUrls
				.map((item) => {
					if (typeof item === 'string') {
						return item;
					}
					// 如果是对象，尝试获取值
					return (item as IDataObject)?.value || (item as IDataObject)?.url || item;
				})
				.filter((url) => url && String(url).trim() !== '');
		} else if (typeof imageUrls === 'string' && imageUrls.trim() !== '') {
			processedUrls = [imageUrls];
		}

		if (processedUrls.length === 0) {
			throw new Error('At least one image URL is required');
		}

		params.image_urls = processedUrls;

		// 可选参数
		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		const generateAudio = this.executeFunctions.getNodeParameter(
			'generate_audio',
			this.itemIndex,
		) as boolean;
		if (generateAudio !== undefined && generateAudio !== null) {
			params.generate_audio = generateAudio;
		}

		const autoFix = this.executeFunctions.getNodeParameter('auto_fix', this.itemIndex) as boolean;
		if (autoFix !== undefined && autoFix !== null) {
			params.auto_fix = autoFix;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Veo 3.1 Reference-to-Video 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

