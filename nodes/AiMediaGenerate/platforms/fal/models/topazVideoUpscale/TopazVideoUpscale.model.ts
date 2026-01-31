import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class TopazVideoUpscaleModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'topazVideoUpscale',
			displayName: 'Topaz Video AI Upscale',
			endpoint: '/fal-ai/topaz/upscale/video',
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
					'URL of the video to upscale. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Upscale Factor',
				name: 'upscale_factor',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 8,
					numberStepSize: 0.5,
				},
				default: 2,
				description:
					'Factor to upscale the video by (e.g. 2.0 doubles width and height). Supports up to 8x upscaling.',
			},
			{
				displayName: 'Target FPS',
				name: 'target_fps',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 120,
				},
				default: '',
				description:
					'Target FPS for frame interpolation. If set, frame interpolation will be automatically enabled. Supports up to 120 FPS output.',
			},
			{
				displayName: 'H264 Output',
				name: 'H264_output',
				type: 'boolean',
				default: false,
				description:
					'Whether to use H264 codec for output video. Default is H265.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数
		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;
		if (!videoUrl || videoUrl.trim() === '') {
			throw new Error('Video URL is required');
		}
		params.video_url = videoUrl.trim();

		// 可选参数
		const upscaleFactor = this.executeFunctions.getNodeParameter(
			'upscale_factor',
			this.itemIndex,
		) as number;
		if (upscaleFactor !== undefined && upscaleFactor !== null) {
			params.upscale_factor = upscaleFactor;
		}

		const targetFps = this.executeFunctions.getNodeParameter('target_fps', this.itemIndex) as
			| number
			| string;
		if (targetFps !== undefined && targetFps !== null && targetFps !== '') {
			params.target_fps =
				typeof targetFps === 'number' ? targetFps : parseInt(targetFps as string, 10);
		}

		const h264Output = this.executeFunctions.getNodeParameter('H264_output', this.itemIndex) as boolean;
		if (h264Output !== undefined) {
			params.H264_output = h264Output;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Topaz Video Upscale 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}


