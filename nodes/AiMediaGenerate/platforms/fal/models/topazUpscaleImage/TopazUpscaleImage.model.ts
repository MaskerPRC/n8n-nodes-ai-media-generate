import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class TopazUpscaleImageModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'topazUpscaleImage',
			displayName: 'Topaz Upscale Image',
			endpoint: '/fal-ai/topaz/upscale/image',
			supportsSync: false,
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
					'URL of the image to be upscaled. Can be a publicly accessible URL or a base64 data URI.',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'CGI',
						value: 'CGI',
					},
					{
						name: 'High Fidelity V2',
						value: 'High Fidelity V2',
					},
					{
						name: 'Low Resolution V2',
						value: 'Low Resolution V2',
					},
					{
						name: 'Recovery',
						value: 'Recovery',
					},
					{
						name: 'Recovery V2',
						value: 'Recovery V2',
					},
					{
						name: 'Redefine',
						value: 'Redefine',
					},
					{
						name: 'Standard V2',
						value: 'Standard V2',
					},
					{
						name: 'Text Refine',
						value: 'Text Refine',
					},
				],
				default: 'Standard V2',
				description: 'Model to use for image enhancement',
			},
			{
				displayName: 'Upscale Factor',
				name: 'upscale_factor',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
					numberStepSize: 0.1,
				},
				default: 2,
				description: 'Factor to upscale the image by (e.g. 2.0 doubles width and height)',
			},
			{
				displayName: 'Crop to Fill',
				name: 'crop_to_fill',
				type: 'boolean',
				default: false,
				description: 'Whether to crop the image to fill',
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
				],
				default: 'jpeg',
				description: 'Output format of the upscaled image',
			},
			{
				displayName: 'Subject Detection',
				name: 'subject_detection',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'All',
					},
					{
						name: 'Foreground',
						value: 'Foreground',
					},
					{
						name: 'Background',
						value: 'Background',
					},
				],
				default: 'All',
				description: 'Subject detection mode for the image enhancement',
			},
			{
				displayName: 'Face Enhancement',
				name: 'face_enhancement',
				type: 'boolean',
				default: true,
				description: 'Whether to apply face enhancement to the image',
			},
			{
				displayName: 'Face Enhancement Creativity',
				name: 'face_enhancement_creativity',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.5,
				displayOptions: {
					show: {
						face_enhancement: [true],
					},
				},
				description:
					'Creativity level for face enhancement. 0.0 means no creativity, 1.0 means maximum creativity. Ignored if face enhancement is disabled.',
			},
			{
				displayName: 'Face Enhancement Strength',
				name: 'face_enhancement_strength',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.8,
				displayOptions: {
					show: {
						face_enhancement: [true],
					},
				},
				description:
					'Strength of the face enhancement. 0.0 means no enhancement, 1.0 means maximum enhancement. Ignored if face enhancement is disabled.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数
		const imageUrl = this.executeFunctions.getNodeParameter('image_url', this.itemIndex) as string;
		if (!imageUrl || imageUrl.trim() === '') {
			throw new Error('Image URL is required');
		}
		params.image_url = imageUrl.trim();

		// 可选参数
		const model = this.executeFunctions.getNodeParameter('model', this.itemIndex) as string;
		if (model) {
			params.model = model;
		}

		const upscaleFactor = this.executeFunctions.getNodeParameter(
			'upscale_factor',
			this.itemIndex,
		) as number;
		if (upscaleFactor !== undefined && upscaleFactor !== null) {
			params.upscale_factor = upscaleFactor;
		}

		const cropToFill = this.executeFunctions.getNodeParameter(
			'crop_to_fill',
			this.itemIndex,
		) as boolean;
		if (cropToFill !== undefined && cropToFill !== null) {
			params.crop_to_fill = cropToFill;
		}

		const outputFormat = this.executeFunctions.getNodeParameter(
			'output_format',
			this.itemIndex,
		) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		const subjectDetection = this.executeFunctions.getNodeParameter(
			'subject_detection',
			this.itemIndex,
		) as string;
		if (subjectDetection) {
			params.subject_detection = subjectDetection;
		}

		const faceEnhancement = this.executeFunctions.getNodeParameter(
			'face_enhancement',
			this.itemIndex,
		) as boolean;
		if (faceEnhancement !== undefined && faceEnhancement !== null) {
			params.face_enhancement = faceEnhancement;

			// 只有在启用面部增强时才添加相关参数
			if (faceEnhancement) {
				const faceEnhancementCreativity = this.executeFunctions.getNodeParameter(
					'face_enhancement_creativity',
					this.itemIndex,
				) as number;
				if (
					faceEnhancementCreativity !== undefined &&
					faceEnhancementCreativity !== null
				) {
					params.face_enhancement_creativity = faceEnhancementCreativity;
				}

				const faceEnhancementStrength = this.executeFunctions.getNodeParameter(
					'face_enhancement_strength',
					this.itemIndex,
				) as number;
				if (faceEnhancementStrength !== undefined && faceEnhancementStrength !== null) {
					params.face_enhancement_strength = faceEnhancementStrength;
				}
			}
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Topaz Upscale Image 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

