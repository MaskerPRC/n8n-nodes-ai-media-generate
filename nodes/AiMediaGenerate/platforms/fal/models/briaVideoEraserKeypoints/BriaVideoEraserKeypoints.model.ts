import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class BriaVideoEraserKeypointsModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'briaVideoEraserKeypoints',
			displayName: 'Bria Video Eraser (Erase By Keypoints)',
			endpoint: '/bria/bria_video_eraser/erase/keypoints',
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
					'Input video to erase object from. Duration must be less than 5s. Must be publicly accessible or base64 data URI.',
			},
			{
				displayName: 'Keypoints',
				name: 'keypoints',
				type: 'collection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: {},
				placeholder: 'Add Keypoint',
				options: [
					{
						displayName: 'X',
						name: 'x',
						type: 'number',
						default: 0,
						description: 'X coordinate of the keypoint',
					},
					{
						displayName: 'Y',
						name: 'y',
						type: 'number',
						default: 0,
						description: 'Y coordinate of the keypoint',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{
								name: 'Positive',
								value: 'positive',
								description: 'Point to erase',
							},
							{
								name: 'Negative',
								value: 'negative',
								description: 'Point to keep',
							},
						],
						default: 'positive',
						description: 'Type of keypoint: positive to erase, negative to keep',
					},
				],
				required: true,
				description: 'Input keypoints [x,y] to erase or keep from the video. Format: {\'x\':100, \'y\':100, \'type\':\'positive/negative\'}.',
			},
			{
				displayName: 'Output Container and Codec',
				name: 'output_container_and_codec',
				type: 'options',
				options: [
					{
						name: 'GIF',
						value: 'gif',
					},
					{
						name: 'MKV H.264',
						value: 'mkv_h264',
					},
					{
						name: 'MKV H.265',
						value: 'mkv_h265',
					},
					{
						name: 'MKV MPEG4',
						value: 'mkv_mpeg4',
					},
					{
						name: 'MKV VP9',
						value: 'mkv_vp9',
					},
					{
						name: 'MOV H.264',
						value: 'mov_h264',
					},
					{
						name: 'MOV H.265',
						value: 'mov_h265',
					},
					{
						name: 'MOV ProRes',
						value: 'mov_proresks',
					},
					{
						name: 'MP4 H.264',
						value: 'mp4_h264',
					},
					{
						name: 'MP4 H.265',
						value: 'mp4_h265',
					},
					{
						name: 'WebM VP9',
						value: 'webm_vp9',
					},
				],
				default: 'mp4_h264',
				description: 'Output container and codec format',
			},
			{
				displayName: 'Preserve Audio',
				name: 'preserve_audio',
				type: 'boolean',
				default: true,
				description: 'Whether to preserve audio in the output video',
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

		// 必需参数：keypoints
		const keypointsData = this.executeFunctions.getNodeParameter('keypoints', this.itemIndex) as
			| IDataObject
			| IDataObject[]
			| undefined;

		if (!keypointsData) {
			throw new Error('At least one keypoint is required');
		}

		// 处理 keypoints 数组
		// n8n 的 collection 类型可能返回对象数组或单个对象
		let keypointsArray: IDataObject[];
		if (Array.isArray(keypointsData)) {
			keypointsArray = keypointsData;
		} else if (typeof keypointsData === 'object') {
			// 如果是单个对象，检查是否有多个值
			// n8n collection 的 multipleValues 可能返回 { '0': {...}, '1': {...} } 格式
			const keys = Object.keys(keypointsData);
			if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
				// 如果是索引键格式，转换为数组
				keypointsArray = keys.map((k) => keypointsData[k] as IDataObject);
			} else {
				// 单个对象
				keypointsArray = [keypointsData];
			}
		} else {
			throw new Error('Keypoints must be an object or array of objects');
		}

		// 验证并格式化 keypoints
		const formattedKeypoints: string[] = [];
		for (const keypoint of keypointsArray) {
			const x = keypoint.x;
			const y = keypoint.y;
			const type = keypoint.type;

			if (x === undefined || y === undefined || !type) {
				throw new Error('Each keypoint must have x, y, and type fields');
			}

			// 格式化为字符串：{'x': 765, 'y': 344, 'type': 'positive'}
			const keypointString = `{'x': ${x}, 'y': ${y}, 'type': '${type}'}`;
			formattedKeypoints.push(keypointString);
		}

		if (formattedKeypoints.length === 0) {
			throw new Error('At least one keypoint is required');
		}

		params.keypoints = formattedKeypoints;

		// 可选参数：output_container_and_codec
		const outputContainerAndCodec = this.executeFunctions.getNodeParameter(
			'output_container_and_codec',
			this.itemIndex,
		) as string;
		if (outputContainerAndCodec) {
			params.output_container_and_codec = outputContainerAndCodec;
		}

		// 可选参数：preserve_audio
		const preserveAudio = this.executeFunctions.getNodeParameter(
			'preserve_audio',
			this.itemIndex,
		) as boolean;
		if (preserveAudio !== undefined) {
			params.preserve_audio = preserveAudio;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Bria Video Eraser 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video）
		return response;
	}
}

