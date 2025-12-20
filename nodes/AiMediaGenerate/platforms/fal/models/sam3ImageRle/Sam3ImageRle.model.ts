import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Sam3ImageRleModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'sam3ImageRle',
			displayName: 'SAM 3 Image RLE',
			endpoint: '/fal-ai/sam-3/image-rle',
			supportsSync: true,
			supportsAsync: true,
			modelType: 'image',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL of the image to be segmented. Can be a publicly accessible URL or a base64 data URI.',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: 'wheel',
				description: 'Text prompt for segmentation',
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
						name: 'point',
						displayName: 'Point',
						values: [
							{
						displayName: 'Frame Index',
						name: 'frame_index',
						type: 'number',
						default: '',
						description: 'The frame index to interact with',
							},
							{
						displayName: 'Label',
						name: 'label',
						type: 'options',
						options: [
									{
										name: 'Background (0)',
										value: 0
									},
									{
										name: 'Foreground (1)',
										value: 1
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
						displayName: 'X Coordinate',
						name: 'x',
						type: 'number',
						default: 0,
							required:	true,
						description: 'X coordinate of the prompt',
							},
							{
						displayName: 'Y Coordinate',
						name: 'y',
						type: 'number',
						default: 0,
							required:	true,
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
				},
				default: {},
				description:
					'Box prompt coordinates (x_min, y_min, x_max, y_max). Multiple boxes supported - use object_id to group boxes for the same object or leave empty for separate objects.',
				options: [
					{
						name: 'box',
						displayName: 'Box',
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
							required:	true,
						description: 'X Max coordinate of the box',
							},
							{
						displayName: 'X Min',
						name: 'x_min',
						type: 'number',
						default: 0,
							required:	true,
						description: 'X Min coordinate of the box',
							},
							{
						displayName: 'Y Max',
						name: 'y_max',
						type: 'number',
						default: 0,
							required:	true,
						description: 'Y Max coordinate of the box',
							},
							{
						displayName: 'Y Min',
						name: 'y_min',
						type: 'number',
						default: 0,
							required:	true,
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
				default: true,
				description: 'Whether to apply the mask on the image',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				description:
					'Whether to return the media as a data URI. If True, the output data won\'t be available in the request history.',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{
						name: 'JPEG',
						value: 'jpeg',
					},
					{
						name: 'PNG',
						value: 'png',
					},
					{
						name: 'WebP',
						value: 'webp',
					},
				],
				default: 'png',
				description: 'The format of the generated image',
			},
			{
				displayName: 'Return Multiple Masks',
				name: 'return_multiple_masks',
				type: 'boolean',
				default: false,
				description: 'Whether to upload and return multiple generated masks as defined by max_masks',
			},
			{
				displayName: 'Max Masks',
				name: 'max_masks',
				type: 'number',
				default: 3,
				displayOptions: {
					show: {
						return_multiple_masks: [true],
					},
				},
				description:
					'Maximum number of masks to return when return_multiple_masks is enabled',
			},
			{
				displayName: 'Include Scores',
				name: 'include_scores',
				type: 'boolean',
				default: false,
				description: 'Whether to include mask confidence scores',
			},
			{
				displayName: 'Include Boxes',
				name: 'include_boxes',
				type: 'boolean',
				default: false,
				description: 'Whether to include bounding boxes for each mask (when available)',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：image_url
		const imageUrl = this.executeFunctions.getNodeParameter('image_url', this.itemIndex) as string;
		if (!imageUrl || imageUrl.trim() === '') {
			throw new Error('Image URL is required');
		}
		params.image_url = imageUrl.trim();

		// 可选参数：prompt
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (prompt && prompt.trim() !== '') {
			params.prompt = prompt.trim();
		}

		// 处理 point_prompts
		const pointPromptsData = this.executeFunctions.getNodeParameter(
			'point_prompts',
			this.itemIndex,
		) as IDataObject;
		if (pointPromptsData && pointPromptsData.point) {
			const points = Array.isArray(pointPromptsData.point)
				? pointPromptsData.point
				: [pointPromptsData.point];
			params.point_prompts = points.map((point: IDataObject) => {
				const pointPrompt: IDataObject = {
					x: point.x,
					y: point.y,
					label: point.label !== undefined ? point.label : 1,
				};
				if (point.object_id !== undefined && point.object_id !== null && point.object_id !== '') {
					pointPrompt.object_id = Number(point.object_id);
				}
				if (
					point.frame_index !== undefined &&
					point.frame_index !== null &&
					point.frame_index !== ''
				) {
					pointPrompt.frame_index = Number(point.frame_index);
				}
				return pointPrompt;
			});
		}

		// 处理 box_prompts
		const boxPromptsData = this.executeFunctions.getNodeParameter(
			'box_prompts',
			this.itemIndex,
		) as IDataObject;
		if (boxPromptsData && boxPromptsData.box) {
			const boxes = Array.isArray(boxPromptsData.box) ? boxPromptsData.box : [boxPromptsData.box];
			params.box_prompts = boxes.map((box: IDataObject) => {
				const boxPrompt: IDataObject = {
					x_min: box.x_min,
					y_min: box.y_min,
					x_max: box.x_max,
					y_max: box.y_max,
				};
				if (box.object_id !== undefined && box.object_id !== null && box.object_id !== '') {
					boxPrompt.object_id = Number(box.object_id);
				}
				if (box.frame_index !== undefined && box.frame_index !== null && box.frame_index !== '') {
					boxPrompt.frame_index = Number(box.frame_index);
				}
				return boxPrompt;
			});
		}

		// 可选参数：apply_mask
		const applyMask = this.executeFunctions.getNodeParameter('apply_mask', this.itemIndex) as boolean;
		params.apply_mask = applyMask;

		// 可选参数：sync_mode
		const syncMode = this.executeFunctions.getNodeParameter('sync_mode', this.itemIndex) as boolean;
		params.sync_mode = syncMode;

		// 可选参数：output_format
		const outputFormat = this.executeFunctions.getNodeParameter('output_format', this.itemIndex) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		// 可选参数：return_multiple_masks
		const returnMultipleMasks = this.executeFunctions.getNodeParameter(
			'return_multiple_masks',
			this.itemIndex,
		) as boolean;
		if (returnMultipleMasks) {
			params.return_multiple_masks = true;
			const maxMasks = this.executeFunctions.getNodeParameter('max_masks', this.itemIndex) as number;
			if (maxMasks !== undefined && maxMasks !== null) {
				params.max_masks = maxMasks;
			}
		}

		// 可选参数：include_scores
		const includeScores = this.executeFunctions.getNodeParameter(
			'include_scores',
			this.itemIndex,
		) as boolean;
		if (includeScores) {
			params.include_scores = true;
		}

		// 可选参数：include_boxes
		const includeBoxes = this.executeFunctions.getNodeParameter(
			'include_boxes',
			this.itemIndex,
		) as boolean;
		if (includeBoxes) {
			params.include_boxes = true;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 rle, metadata, scores, boxes 等）
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 rle, metadata, scores, boxes 等）
		return response;
	}
}

