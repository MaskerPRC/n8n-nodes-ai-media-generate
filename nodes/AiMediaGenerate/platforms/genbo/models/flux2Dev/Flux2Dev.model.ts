import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseGenboModel } from '../../shared/baseGenboModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Flux2DevModel extends BaseGenboModel {
	getConfig(): ModelConfig {
		return {
			name: 'flux2Dev',
			displayName: 'Flux.2-dev',
			endpoint: '/v1/images/generations',
			supportsSync: false,
			supportsAsync: true,
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
				description: 'The text prompt describing the desired image',
			},
			{
				displayName: 'Image Size',
				name: 'image_size',
				type: 'options',
				options: [
					{
						name: '1:1',
						value: '1:1',
					},
					{
						name: '16:9',
						value: '16:9',
					},
					{
						name: '3:4',
						value: '3:4',
					},
					{
						name: '4:3',
						value: '4:3',
					},
					{
						name: '9:16',
						value: '9:16',
					},
				],
				default: '9:16',
				description: 'The aspect ratio of the generated image',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				description: 'The number of images to generate',
			},
			{
				displayName: 'Guidance Scale',
				name: 'guidance_scale',
				type: 'number',
				default: 4,
				description: 'The guidance scale for image generation (default: 4)',
			},
			{
				displayName: 'Number of Inference Steps',
				name: 'num_inference_steps',
				type: 'number',
				default: 20,
				description: 'The number of inference steps (default: 20)',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {
			model: 'Flux.2-dev',
		};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}
		params.prompt = prompt;

		// 可选参数
		const imageSize = this.executeFunctions.getNodeParameter('image_size', this.itemIndex) as string;
		if (imageSize) {
			params.image_size = imageSize;
		}

		const numImages = this.executeFunctions.getNodeParameter('num_images', this.itemIndex) as number;
		if (numImages !== undefined && numImages !== null) {
			params.num_images = numImages;
		}

		const guidanceScale = this.executeFunctions.getNodeParameter(
			'guidance_scale',
			this.itemIndex,
		) as number;
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

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Flux.2-dev 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}


