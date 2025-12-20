import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Flux2MaxModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'flux2Max',
			displayName: 'FLUX.2 Max',
			endpoint: '/fal-ai/flux-2-max',
			supportsSync: true,
			supportsAsync: true,
			modelType: 'image',
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
				description: 'The prompt to generate an image from',
			},
			{
				displayName: 'Image Size',
				name: 'image_size',
				type: 'options',
				options: [
					{
						name: 'Custom',
						value: 'custom',
					},
					{
						name: 'Landscape 16:9',
						value: 'landscape_16_9',
					},
					{
						name: 'Landscape 4:3',
						value: 'landscape_4_3',
					},
					{
						name: 'Portrait 16:9',
						value: 'portrait_16_9',
					},
					{
						name: 'Portrait 4:3',
						value: 'portrait_4_3',
					},
					{
						name: 'Square',
						value: 'square',
					},
					{
						name: 'Square HD',
						value: 'square_hd',
					},
				],
				default: 'landscape_4_3',
				description: 'The size of the generated image',
			},
			{
				displayName: 'Custom Width',
				name: 'image_size_width',
				type: 'number',
				default: 1280,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom width for the image',
			},
			{
				displayName: 'Custom Height',
				name: 'image_size_height',
				type: 'number',
				default: 720,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom height for the image',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'The seed to use for the generation. The same seed and the same prompt given to the same version of the model will output the same image every time. Leave empty for random seed.',
			},
			{
				displayName: 'Safety Tolerance',
				name: 'safety_tolerance',
				type: 'options',
				options: [
					{
						name: '1 (Most Strict)',
						value: '1',
					},
					{
						name: '2',
						value: '2',
					},
					{
						name: '3',
						value: '3',
					},
					{
						name: '4',
						value: '4',
					},
					{
						name: '5 (Most Permissive)',
						value: '5',
					},
				],
				default: '2',
				description:
					'The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive. This property is only available through API calls.',
			},
			{
				displayName: 'Enable Safety Checker',
				name: 'enable_safety_checker',
				type: 'boolean',
				default: true,
				description: 'Whether to enable the safety checker',
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
				description: 'The format of the generated image',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				description: 'Whether to return the media as a data URI and make the output data unavailable in the request history',
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

		// Image size 处理
		const imageSize = this.executeFunctions.getNodeParameter('image_size', this.itemIndex) as string;
		if (imageSize === 'custom') {
			const width = this.executeFunctions.getNodeParameter('image_size_width', this.itemIndex) as number;
			const height = this.executeFunctions.getNodeParameter('image_size_height', this.itemIndex) as number;
			params.image_size = {
				width,
				height,
			};
		} else if (imageSize) {
			params.image_size = imageSize;
		}

		// 可选参数
		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		const safetyTolerance = this.executeFunctions.getNodeParameter(
			'safety_tolerance',
			this.itemIndex,
		) as string;
		if (safetyTolerance) {
			params.safety_tolerance = safetyTolerance;
		}

		const enableSafetyChecker = this.executeFunctions.getNodeParameter(
			'enable_safety_checker',
			this.itemIndex,
		) as boolean;
		params.enable_safety_checker = enableSafetyChecker;

		const outputFormat = this.executeFunctions.getNodeParameter('output_format', this.itemIndex) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		const syncMode = this.executeFunctions.getNodeParameter('sync_mode', this.itemIndex) as boolean;
		params.sync_mode = syncMode;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

