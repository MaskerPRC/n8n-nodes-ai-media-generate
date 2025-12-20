import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class VeedVideoBackgroundRemovalFastModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'veedVideoBackgroundRemovalFast',
			displayName: 'VEED Video Background Removal Fast',
			endpoint: '/veed/video-background-removal/fast',
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
					'URL of the video to process. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Output Codec',
				name: 'output_codec',
				type: 'options',
				options: [
					{
						name: 'VP9',
						value: 'vp9',
						description: 'Single VP9 video with alpha channel',
					},
					{
						name: 'H264',
						value: 'h264',
						description: 'Two videos (rgb and alpha) in H264 format. Recommended for better RGB quality.',
					},
				],
				default: 'vp9',
				description:
					'Single VP9 video with alpha channel or two videos (rgb and alpha) in H264 format. H264 is recommended for better RGB quality.',
			},
			{
				displayName: 'Refine Foreground Edges',
				name: 'refine_foreground_edges',
				type: 'boolean',
				default: true,
				description: 'Whether to improve the quality of the extracted object\'s edges',
			},
			{
				displayName: 'Subject Is Person',
				name: 'subject_is_person',
				type: 'boolean',
				default: true,
				description: 'Whether the subject is a person',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：video_url
		const videoUrl = this.executeFunctions.getNodeParameter('video_url', this.itemIndex) as string;
		if (!videoUrl || videoUrl.trim() === '') {
			throw new Error('Video URL is required');
		}
		params.video_url = videoUrl.trim();

		// 可选参数：output_codec
		const outputCodec = this.executeFunctions.getNodeParameter('output_codec', this.itemIndex) as string;
		if (outputCodec) {
			params.output_codec = outputCodec;
		}

		// 可选参数：refine_foreground_edges
		const refineForegroundEdges = this.executeFunctions.getNodeParameter(
			'refine_foreground_edges',
			this.itemIndex,
		) as boolean;
		if (refineForegroundEdges !== undefined) {
			params.refine_foreground_edges = refineForegroundEdges;
		}

		// 可选参数：subject_is_person
		const subjectIsPerson = this.executeFunctions.getNodeParameter(
			'subject_is_person',
			this.itemIndex,
		) as boolean;
		if (subjectIsPerson !== undefined) {
			params.subject_is_person = subjectIsPerson;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// VEED Video Background Removal Fast 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}

