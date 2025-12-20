import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Wan26R2VModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'wan26r2v',
			displayName: 'WAN 2.6 Reference-to-Video',
			endpoint: '/wan/v2.6/reference-to-video',
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
					'Use @Video1, @Video2, @Video3 to reference subjects from your videos. Works for people, animals, or objects. For multi-shot prompts: \'[0-3s] Shot 1. [3-6s] Shot 2.\' Max 800 characters.',
			},
			{
				displayName: 'Video URLs',
				name: 'video_urls',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Video URL',
				},
				default: [],
				required: true,
				description:
					'Reference videos for subject consistency (1-3 videos). Videos\' FPS must be at least 16 FPS. Reference in prompt as @Video1, @Video2, @Video3. Format: mp4, mov. Duration: 2-30 seconds each. File size: Up to 30MB each.',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
				type: 'options',
				options: [
					{
						name: '1:1',
						value: '1:1',
					},
					{
						name: '16:9',
						value: '16:9',
					},
					{
						name: '3:4',
						value: '3:4',
					},
					{
						name: '4:3',
						value: '4:3',
					},
					{
						name: '9:16',
						value: '9:16',
					},
				],
				default: '16:9',
				description: 'The aspect ratio of the generated video',
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
				default: '1080p',
				description: 'Video resolution tier. R2V only supports 720p and 1080p (no 480p).',
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
				description: 'Duration of the generated video in seconds. R2V supports only 5 or 10 seconds (no 15s).',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negative_prompt',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description: 'Negative prompt to describe content to avoid. Max 500 characters.',
			},
			{
				displayName: 'Enable Prompt Expansion',
				name: 'enable_prompt_expansion',
				type: 'boolean',
				default: true,
				description: 'Whether to enable prompt rewriting using LLM',
			},
			{
				displayName: 'Multi Shots',
				name: 'multi_shots',
				type: 'boolean',
				default: true,
				description:
					'Whether to enable intelligent multi-shot segmentation for coherent narrative videos with multiple shots. When false, generates single continuous shot. Only active when enable_prompt_expansion is True.',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description: 'Random seed for reproducibility. Leave empty for random seed.',
			},
			{
				displayName: 'Enable Safety Checker',
				name: 'enable_safety_checker',
				type: 'boolean',
				default: true,
				description: 'Whether to enable the safety checker',
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

		// 处理 video_urls
		const videoUrls = this.executeFunctions.getNodeParameter('video_urls', this.itemIndex);
		if (!videoUrls) {
			throw new Error('At least one video URL is required');
		}

		// 处理多种输入格式
		let processedUrls: string[] = [];
		if (Array.isArray(videoUrls)) {
			// n8n 的 multipleValues 可能返回对象数组或字符串数组
			processedUrls = videoUrls
				.map((item) => {
					if (typeof item === 'string') {
						return item;
					}
					// 如果是对象，尝试获取值
					return (item as IDataObject)?.value || (item as IDataObject)?.url || item;
				})
				.filter((url) => url && String(url).trim() !== '');
		} else if (typeof videoUrls === 'string' && videoUrls.trim() !== '') {
			processedUrls = [videoUrls];
		}

		if (processedUrls.length === 0) {
			throw new Error('At least one video URL is required');
		}

		if (processedUrls.length > 3) {
			throw new Error('Maximum 3 video URLs are allowed');
		}

		params.video_urls = processedUrls;

		// 可选参数
		const aspectRatio = this.executeFunctions.getNodeParameter('aspect_ratio', this.itemIndex) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

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

		const enablePromptExpansion = this.executeFunctions.getNodeParameter(
			'enable_prompt_expansion',
			this.itemIndex,
		) as boolean;
		params.enable_prompt_expansion = enablePromptExpansion;

		const multiShots = this.executeFunctions.getNodeParameter('multi_shots', this.itemIndex) as boolean;
		params.multi_shots = multiShots;

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '' && typeof seed === 'number') {
			params.seed = seed;
		}

		const enableSafetyChecker = this.executeFunctions.getNodeParameter(
			'enable_safety_checker',
			this.itemIndex,
		) as boolean;
		params.enable_safety_checker = enableSafetyChecker;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// WAN 2.6 R2V 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

