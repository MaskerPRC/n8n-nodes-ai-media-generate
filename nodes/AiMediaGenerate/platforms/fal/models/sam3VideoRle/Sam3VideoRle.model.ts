import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Sam3VideoRleModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'sam3VideoRle',
			displayName: 'SAM 3 Video RLE',
			endpoint: '/fal-ai/sam-3/video-rle',
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
					'URL of the video to be segmented. Can be a publicly accessible URL or a base64 data URI.',
			},
			{
				displayName: 'Mask URL',
				name: 'mask_url',
				type: 'string',
				default: '',
				description: 'URL of the mask to be applied initially',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: '',
				description:
					'Text prompt for segmentation. Use commas to track multiple objects (e.g., "person, cloth").',
			},
			{
				displayName: 'Point Prompts',
				name: 'point_prompts',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Point Prompt',
				},
				default: {},
				description: 'List of point prompts with frame indices',
				options: [
					{
						name: 'pointPrompt',
						displayName: 'Point Prompt',
						values: [
							{
						displayName: 'Frame Index',
						name: 'frame_index',
						type: 'number',
						default: 0,
						description: 'The frame index to interact with',
							},
							{
						displayName: 'Label',
						name: 'label',
						type: 'options',
						options: [
									{
										name: 'Foreground (1)',
										value: 1
									},
									{
										name: 'Background (0)',
										value: 0
									},
								],
						default: 1,
						description: '1 for foreground, 0 for background',
							},
							{
						displayName: 'Object ID',
						name: 'object_id',
						type: 'number',
						default: '',
						description: 'Optional object identifier. Prompts sharing an object ID refine the same object.',
							},
							{
						displayName: 'X',
						name: 'x',
						type: 'number',
						default: 0,
						description: 'X coordinate of the prompt',
							},
							{
						displayName: 'Y',
						name: 'y',
						type: 'number',
						default: 0,
						description: 'Y coordinate of the prompt',
							},
					],
					},
				],
			},
			{
				displayName: 'Box Prompts',
				name: 'box_prompts',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Box Prompt',
				},
				default: {},
				description: 'List of box prompts with optional frame_index',
				options: [
					{
						name: 'boxPrompt',
						displayName: 'Box Prompt',
						values: [
							{
						displayName: 'Frame Index',
						name: 'frame_index',
						type: 'number',
						default: '',
						description: 'The frame index to interact with',
							},
							{
						displayName: 'Object ID',
						name: 'object_id',
						type: 'number',
						default: '',
						description: 'Optional object identifier. Boxes sharing an object ID refine the same object.',
							},
							{
						displayName: 'X Max',
						name: 'x_max',
						type: 'number',
						default: 0,
						description: 'X Max coordinate of the box',
							},
							{
						displayName: 'X Min',
						name: 'x_min',
						type: 'number',
						default: 0,
						description: 'X Min coordinate of the box',
							},
							{
						displayName: 'Y Max',
						name: 'y_max',
						type: 'number',
						default: 0,
						description: 'Y Max coordinate of the box',
							},
							{
						displayName: 'Y Min',
						name: 'y_min',
						type: 'number',
						default: 0,
						description: 'Y Min coordinate of the box',
							},
						],
					},
				],
			},
			{
				displayName: 'Apply Mask',
				name: 'apply_mask',
				type: 'boolean',
				default: false,
				description: 'Whether to apply the mask on the video',
			},
			{
				displayName: 'Bounding Box Zip',
				name: 'boundingbox_zip',
				type: 'boolean',
				default: false,
				description: 'Whether to return per-frame bounding box overlays as a zip archive',
			},
			{
				displayName: 'Detection Threshold',
				name: 'detection_threshold',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.5,
				description:
					'Detection confidence threshold (0.0-1.0). Lower = more detections but less precise. Defaults: 0.5 for existing, 0.7 for new objects. Try 0.2-0.3 if text prompts fail.',
			},
			{
				displayName: 'Frame Index',
				name: 'frame_index',
				type: 'number',
				default: '',
				description: 'Frame index used for initial interaction when mask_url is provided',
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

		// 可选参数：mask_url
		const maskUrl = this.executeFunctions.getNodeParameter('mask_url', this.itemIndex) as string;
		if (maskUrl && maskUrl.trim() !== '') {
			params.mask_url = maskUrl.trim();
		}

		// 可选参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (prompt && prompt.trim() !== '') {
			params.prompt = prompt.trim();
		}

		// 可选参数：point_prompts
		const pointPromptsData = this.executeFunctions.getNodeParameter(
			'point_prompts',
			this.itemIndex,
		) as {
			pointPrompt?: Array<{
				x: number;
				y: number;
				label?: number;
				object_id?: number;
				frame_index?: number;
			}>;
		};
		if (pointPromptsData && pointPromptsData.pointPrompt && pointPromptsData.pointPrompt.length > 0) {
			params.point_prompts = pointPromptsData.pointPrompt.map((point) => {
				const pointPrompt: IDataObject = {
					x: point.x,
					y: point.y,
					label: point.label !== undefined ? point.label : 1,
				};
				if (point.object_id !== undefined && point.object_id !== null) {
					pointPrompt.object_id = point.object_id;
				}
				if (point.frame_index !== undefined && point.frame_index !== null) {
					pointPrompt.frame_index = point.frame_index;
				}
				return pointPrompt;
			});
		}

		// 可选参数：box_prompts
		const boxPromptsData = this.executeFunctions.getNodeParameter('box_prompts', this.itemIndex) as {
			boxPrompt?: Array<{
				x_min: number;
				y_min: number;
				x_max: number;
				y_max: number;
				object_id?: number;
				frame_index?: number;
			}>;
		};
		if (boxPromptsData && boxPromptsData.boxPrompt && boxPromptsData.boxPrompt.length > 0) {
			params.box_prompts = boxPromptsData.boxPrompt.map((box) => {
				const boxPrompt: IDataObject = {
					x_min: box.x_min,
					y_min: box.y_min,
					x_max: box.x_max,
					y_max: box.y_max,
				};
				if (box.object_id !== undefined && box.object_id !== null) {
					boxPrompt.object_id = box.object_id;
				}
				if (box.frame_index !== undefined && box.frame_index !== null) {
					boxPrompt.frame_index = box.frame_index;
				}
				return boxPrompt;
			});
		}

		// 可选参数：apply_mask
		const applyMask = this.executeFunctions.getNodeParameter('apply_mask', this.itemIndex) as boolean;
		if (applyMask !== undefined) {
			params.apply_mask = applyMask;
		}

		// 可选参数：boundingbox_zip
		const boundingboxZip = this.executeFunctions.getNodeParameter(
			'boundingbox_zip',
			this.itemIndex,
		) as boolean;
		if (boundingboxZip !== undefined) {
			params.boundingbox_zip = boundingboxZip;
		}

		// 可选参数：detection_threshold
		const detectionThreshold = this.executeFunctions.getNodeParameter(
			'detection_threshold',
			this.itemIndex,
		) as number;
		if (detectionThreshold !== undefined && detectionThreshold !== null) {
			params.detection_threshold = detectionThreshold;
		}

		// 可选参数：frame_index
		const frameIndex = this.executeFunctions.getNodeParameter('frame_index', this.itemIndex) as number;
		if (frameIndex !== undefined && frameIndex !== null) {
			params.frame_index = frameIndex;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// SAM 3 Video RLE 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video 和 boundingbox_frames_zip）
		return response;
	}
}

