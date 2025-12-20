import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Flux2DevModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'flux2Dev',
			displayName: 'FLUX.2 [dev]',
			endpoint: '/fal-ai/flux-2',
			syncEndpoint: '/fal-ai/flux-2/stream',
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
				description: 'The size of the image to generate. The width and height must be between 512 and 2048 pixels.',
			},
			{
				displayName: 'Custom Width',
				name: 'image_size_width',
				type: 'number',
				typeOptions: {
					minValue: 512,
					maxValue: 2048,
				},
				default: 1280,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom width for the image (512-2048 pixels)',
			},
			{
				displayName: 'Custom Height',
				name: 'image_size_height',
				type: 'number',
				typeOptions: {
					minValue: 512,
					maxValue: 2048,
				},
				default: 720,
				displayOptions: {
					show: {
						image_size: ['custom'],
					},
				},
				description: 'Custom height for the image (512-2048 pixels)',
			},
			{
				displayName: 'Guidance Scale',
				name: 'guidance_scale',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 20,
					numberStepSize: 0.1,
				},
				default: 2.5,
				description: 'Guidance Scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you',
			},
			{
				displayName: 'Number of Inference Steps',
				name: 'num_inference_steps',
				type: 'number',
				default: 28,
				description: 'The number of inference steps to perform',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'The seed to use for the generation. If not provided, a random seed will be used.',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				description: 'The number of images to generate',
			},
			{
				displayName: 'Acceleration',
				name: 'acceleration',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Regular',
						value: 'regular',
					},
					{
						name: 'High',
						value: 'high',
					},
				],
				default: 'regular',
				description: 'The acceleration level to use for the image generation',
			},
			{
				displayName: 'Enable Prompt Expansion',
				name: 'enable_prompt_expansion',
				type: 'boolean',
				default: false,
				description: 'Whether to expand the prompt for better results',
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
					{
						name: 'WebP',
						value: 'webp',
					},
				],
				default: 'png',
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
		if (!prompt || prompt.trim() === '') {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Prompt is required and cannot be empty',
				{ itemIndex: this.itemIndex },
			);
		}
		params.prompt = prompt;

		// Image size 处理
		const imageSize = this.executeFunctions.getNodeParameter('image_size', this.itemIndex) as string;
		if (imageSize === 'custom') {
			const width = this.executeFunctions.getNodeParameter('image_size_width', this.itemIndex) as number;
			const height = this.executeFunctions.getNodeParameter('image_size_height', this.itemIndex) as number;
			
			// 验证宽度和高度范围（512-2048 像素）
			if (width < 512 || width > 2048) {
				throw new NodeOperationError(
					this.executeFunctions.getNode(),
					`Image width must be between 512 and 2048 pixels. Current value: ${width}`,
					{ itemIndex: this.itemIndex },
				);
			}
			if (height < 512 || height > 2048) {
				throw new NodeOperationError(
					this.executeFunctions.getNode(),
					`Image height must be between 512 and 2048 pixels. Current value: ${height}`,
					{ itemIndex: this.itemIndex },
				);
			}
			
			params.image_size = {
				width,
				height,
			};
		} else if (imageSize) {
			params.image_size = imageSize;
		}

		// 可选参数
		const guidanceScale = this.executeFunctions.getNodeParameter('guidance_scale', this.itemIndex) as number;
		if (guidanceScale !== undefined && guidanceScale !== null) {
			params.guidance_scale = guidanceScale;
		}

		const numInferenceSteps = this.executeFunctions.getNodeParameter(
			'num_inference_steps',
			this.itemIndex,
		) as number;
		if (numInferenceSteps !== undefined && numInferenceSteps !== null) {
			params.num_inference_steps = numInferenceSteps;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		const numImages = this.executeFunctions.getNodeParameter('num_images', this.itemIndex) as number;
		if (numImages !== undefined && numImages !== null) {
			params.num_images = numImages;
		}

		const acceleration = this.executeFunctions.getNodeParameter('acceleration', this.itemIndex) as string;
		if (acceleration) {
			params.acceleration = acceleration;
		}

		const enablePromptExpansion = this.executeFunctions.getNodeParameter(
			'enable_prompt_expansion',
			this.itemIndex,
		) as boolean;
		params.enable_prompt_expansion = enablePromptExpansion;

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

