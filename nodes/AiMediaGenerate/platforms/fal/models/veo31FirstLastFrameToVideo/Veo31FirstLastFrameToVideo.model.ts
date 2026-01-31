import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Veo31FirstLastFrameToVideoModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veo31FirstLastFrameToVideo',
			displayName: 'Veo 3.1 First-Last-Frame-to-Video',
			endpoint: '/fal-ai/veo3.1/first-last-frame-to-video',
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
				displayName: 'First Frame URL',
				name: 'first_frame_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the first frame of the video. Input images up to 8MB in size. Supports publicly accessible URLs or base64 data URIs.',
			},
			{
				displayName: 'Last Frame URL',
				name: 'last_frame_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the last frame of the video. Input images up to 8MB in size. Supports publicly accessible URLs or base64 data URIs.',
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
				description: 'The aspect ratio of the generated video. Default value: "auto".',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '4 Seconds',
						value: '4s',
					},
					{
						name: '6 Seconds',
						value: '6s',
					},
					{
						name: '8 Seconds',
						value: '8s',
					},
				],
				default: '8s',
				description: 'The duration of the generated video. Default value: "8s".',
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
				description: 'The resolution of the generated video. Default value: "720p".',
			},
			{
				displayName: 'Generate Audio',
				name: 'generate_audio',
				type: 'boolean',
				default: true,
				description: 'Whether to generate audio for the video. Default value: true.',
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

		// 必需参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt || prompt.trim() === '') {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt.trim();

		// 必需参数：first_frame_url
		const firstFrameUrl = this.executeFunctions.getNodeParameter(
			'first_frame_url',
			this.itemIndex,
		) as string;
		if (!firstFrameUrl || firstFrameUrl.trim() === '') {
			throw new Error('First Frame URL is required');
		}
		params.first_frame_url = firstFrameUrl.trim();

		// 必需参数：last_frame_url
		const lastFrameUrl = this.executeFunctions.getNodeParameter(
			'last_frame_url',
			this.itemIndex,
		) as string;
		if (!lastFrameUrl || lastFrameUrl.trim() === '') {
			throw new Error('Last Frame URL is required');
		}
		params.last_frame_url = lastFrameUrl.trim();

		// 可选参数：aspect_ratio
		const aspectRatio = this.executeFunctions.getNodeParameter('aspect_ratio', this.itemIndex) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

		// 可选参数：duration
		const duration = this.executeFunctions.getNodeParameter('duration', this.itemIndex) as string;
		if (duration) {
			params.duration = duration;
		}

		// 可选参数：resolution
		const resolution = this.executeFunctions.getNodeParameter('resolution', this.itemIndex) as string;
		if (resolution) {
			params.resolution = resolution;
		}

		// 可选参数：generate_audio
		const generateAudio = this.executeFunctions.getNodeParameter(
			'generate_audio',
			this.itemIndex,
		) as boolean;
		if (generateAudio !== undefined && generateAudio !== null) {
			params.generate_audio = generateAudio;
		}

		// 可选参数：auto_fix
		const autoFix = this.executeFunctions.getNodeParameter('auto_fix', this.itemIndex) as boolean;
		if (autoFix !== undefined && autoFix !== null) {
			params.auto_fix = autoFix;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Veo 3.1 First-Last-Frame-to-Video 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video 对象）
		return response;
	}
}


