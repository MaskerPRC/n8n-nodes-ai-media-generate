import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class QwenImageLayeredModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'qwenImageLayered',
			displayName: 'Qwen Image Layered',
			endpoint: '/fal-ai/qwen-image-layered',
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
					'The URL of the input image. Can be a publicly accessible URL or a base64 data URI.',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',

				description: 'A caption for the input image',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negative_prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',

				description: 'The negative prompt to generate an image from',
			},
			{
				displayName: 'Number of Inference Steps',
				name: 'num_inference_steps',
				type: 'number',
				default: 28,

				description: 'The number of inference steps to perform',
			},
			{
				displayName: 'Guidance Scale',
				name: 'guidance_scale',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberStepSize: 0.1,
				},
				default: 5,

				description: 'The guidance scale to use for the image generation',
			},
			{
				displayName: 'Number of Layers',
				name: 'num_layers',
				type: 'number',
				default: 4,

				description: 'The number of layers to generate',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',

				description:
					'The same seed and the same prompt given to the same version of the model will output the same image every time. Leave empty for random seed.',
			},
			{
				displayName: 'Enable Safety Checker',
				name: 'enable_safety_checker',
				type: 'boolean',
				default: true,
				description: 'Whether the safety checker will be enabled',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
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

				description: 'The acceleration level to use',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				description: 'Whether the media will be returned as a data URI and the output data won\'t be available in the request history',
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
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (prompt && prompt.trim() !== '') {
			params.prompt = prompt.trim();
		}

		const negativePrompt = this.executeFunctions.getNodeParameter(
			'negative_prompt',
			this.itemIndex,
		) as string;
		if (negativePrompt && negativePrompt.trim() !== '') {
			params.negative_prompt = negativePrompt.trim();
		}

		const numInferenceSteps = this.executeFunctions.getNodeParameter(
			'num_inference_steps',
			this.itemIndex,
		) as number;
		if (numInferenceSteps !== undefined && numInferenceSteps !== null) {
			params.num_inference_steps = numInferenceSteps;
		}

		const guidanceScale = this.executeFunctions.getNodeParameter(
			'guidance_scale',
			this.itemIndex,
		) as number;
		if (guidanceScale !== undefined && guidanceScale !== null) {
			params.guidance_scale = guidanceScale;
		}

		const numLayers = this.executeFunctions.getNodeParameter('num_layers', this.itemIndex) as number;
		if (numLayers !== undefined && numLayers !== null) {
			params.num_layers = numLayers;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		const enableSafetyChecker = this.executeFunctions.getNodeParameter(
			'enable_safety_checker',
			this.itemIndex,
		) as boolean;
		if (enableSafetyChecker !== undefined) {
			params.enable_safety_checker = enableSafetyChecker;
		}

		const outputFormat = this.executeFunctions.getNodeParameter('output_format', this.itemIndex) as string;
		if (outputFormat) {
			params.output_format = outputFormat;
		}

		const acceleration = this.executeFunctions.getNodeParameter('acceleration', this.itemIndex) as string;
		if (acceleration) {
			params.acceleration = acceleration;
		}

		const syncMode = this.executeFunctions.getNodeParameter('sync_mode', this.itemIndex) as boolean;
		if (syncMode !== undefined) {
			params.sync_mode = syncMode;
		}

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

