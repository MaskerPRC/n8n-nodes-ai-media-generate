import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Veo31ExtendVideoModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veo31ExtendVideo',
			displayName: 'Veo 3.1 Extend Video',
			endpoint: '/fal-ai/veo3.1/extend-video',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'video',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Video URL',
				name: 'video_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the video to extend. The video should be 720p or 1080p resolution in 16:9 or 9:16 aspect ratio. Must be publicly accessible or base64 data URI.',
			},
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
					'The text prompt describing how the video should be extended. Include: Action (what should happen next), Style (maintain or transition to a specific visual style), Camera motion (optional), Ambiance (optional).',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
				type: 'options',
				options: [
					{
						name: 'Auto',
						value: 'auto',
					},
					{
						name: '16:9',
						value: '16:9',
					},
					{
						name: '9:16',
						value: '9:16',
					},
				],
				default: 'auto',
				description: 'The aspect ratio of the generated video',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '7 Seconds',
						value: '7s',
					},
				],
				default: '7s',
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
		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;
		if (!videoUrl) {
			throw new Error('Video URL is required');
		}
		params.video_url = videoUrl;

		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		// 可选参数
		const aspectRatio = this.executeFunctions.getNodeParameter('aspect_ratio', this.itemIndex) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

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
		if (generateAudio !== undefined) {
			params.generate_audio = generateAudio;
		}

		const autoFix = this.executeFunctions.getNodeParameter('auto_fix', this.itemIndex) as boolean;
		if (autoFix !== undefined) {
			params.auto_fix = autoFix;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Veo 3.1 Extend Video 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}


