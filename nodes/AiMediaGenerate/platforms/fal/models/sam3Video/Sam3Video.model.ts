import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Sam3VideoModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'sam3Video',
			displayName: 'Segment Video Simple',
			endpoint: '/fal-ai/sam-3/video',
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
					'URL of the video to be segmented. Must be publicly accessible or base64 data URI.',
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
				},
				default: {},
				description: 'List of point prompts for segmentation',
				options: [
					{
						displayName: 'Point Prompt',
						name: 'point_prompt',
						values: [
							{
								displayName: 'X',
								name: 'x',
								type: 'number',
								default: 0,
								description: 'X coordinate of the prompt',
								required: true,
							},
							{
								displayName: 'Y',
								name: 'y',
								type: 'number',
								default: 0,
								description: 'Y coordinate of the prompt',
								required: true,
							},
							{
								displayName: 'Label',
								name: 'label',
								type: 'options',
								options: [
									{
										name: 'Foreground',
										value: 1,
									},
									{
										name: 'Background',
										value: 0,
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
				},
				default: {},
				description: 'List of box prompt coordinates (x_min, y_min, x_max, y_max)',
				options: [
					{
						displayName: 'Box Prompt',
						name: 'box_prompt',
						values: [
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
							required:	true,
							},
							{
						displayName: 'X Min',
						name: 'x_min',
						type: 'number',
						default: 0,
						description: 'X Min coordinate of the box',
							required:	true,
							},
							{
						displayName: 'Y Max',
						name: 'y_max',
						type: 'number',
						default: 0,
						description: 'Y Max coordinate of the box',
							required:	true,
							},
							{
						displayName: 'Y Min',
						name: 'y_min',
						type: 'number',
						default: 0,
						description: 'Y Min coordinate of the box',
							required:	true,
							},
						],
					},
				],
			},
			{
				displayName: 'Apply Mask',
				name: 'apply_mask',
				type: 'boolean',
				default: true,
				description: 'Whether to apply the mask on the video',
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
					'Detection confidence threshold (0.0-1.0). Lower = more detections but less precise.',
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
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (prompt && prompt.trim() !== '') {
			params.prompt = prompt.trim();
		}

		// Point prompts
		const pointPromptsData = this.executeFunctions.getNodeParameter(
			'point_prompts',
			this.itemIndex,
		) as IDataObject;
		if (pointPromptsData && pointPromptsData.point_prompt) {
			const pointPrompts = (pointPromptsData.point_prompt as IDataObject[]).map((point) => ({
				x: point.x as number,
				y: point.y as number,
				label: point.label as number,
				...(point.object_id !== undefined && point.object_id !== null && point.object_id !== ''
					? { object_id: point.object_id as number }
					: {}),
			}));
			if (pointPrompts.length > 0) {
				params.point_prompts = pointPrompts;
			}
		}

		// Box prompts
		const boxPromptsData = this.executeFunctions.getNodeParameter(
			'box_prompts',
			this.itemIndex,
		) as IDataObject;
		if (boxPromptsData && boxPromptsData.box_prompt) {
			const boxPrompts = (boxPromptsData.box_prompt as IDataObject[]).map((box) => ({
				x_min: box.x_min as number,
				y_min: box.y_min as number,
				x_max: box.x_max as number,
				y_max: box.y_max as number,
				...(box.object_id !== undefined && box.object_id !== null && box.object_id !== ''
					? { object_id: box.object_id as number }
					: {}),
			}));
			if (boxPrompts.length > 0) {
				params.box_prompts = boxPrompts;
			}
		}

		const applyMask = this.executeFunctions.getNodeParameter('apply_mask', this.itemIndex) as boolean;
		if (applyMask !== undefined) {
			params.apply_mask = applyMask;
		}

		const detectionThreshold = this.executeFunctions.getNodeParameter(
			'detection_threshold',
			this.itemIndex,
		) as number;
		if (detectionThreshold !== undefined && detectionThreshold !== null) {
			params.detection_threshold = detectionThreshold;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// SAM-3 Video 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 video 和 boundingbox_frames_zip）
		return response;
	}
}

