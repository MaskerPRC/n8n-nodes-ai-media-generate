import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseReplicateModel } from '../../shared/baseReplicateModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class ZImageTurboModel extends BaseReplicateModel {
	getConfig(): ModelConfig {
		return {
			name: 'zImageTurbo',
			displayName: 'Z-image-turbo',
			endpoint: '/v1/predictions',
			supportsSync: true,
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
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 1024,
				description: 'Width of the generated image',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 768,
				description: 'Height of the generated image',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{
						name: 'JPG',
						value: 'jpg',
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
				default: 'jpg',
				description: 'The format of the generated image',
			},
			{
				displayName: 'Guidance Scale',
				name: 'guidance_scale',
				type: 'number',
				default: 0,
				description: 'Guidance scale for image generation (default: 0)',
			},
			{
				displayName: 'Output Quality',
				name: 'output_quality',
				type: 'number',
				default: 80,
				description: 'Output quality of the generated image (default: 80)',
			},
			{
				displayName: 'Number of Inference Steps',
				name: 'num_inference_steps',
				type: 'number',
				default: 8,
				description: 'The number of inference steps to perform (default: 8)',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {
			version: 'prunaai/z-image-turbo',
		};

		// 必需参数
		const prompt = this.executeFunctions.getNodeParameter('prompt', this.itemIndex) as string;
		if (!prompt) {
			throw new Error('Prompt is required');
		}

		// 构建 input 对象
		const input: IDataObject = {
			prompt: prompt,
		};

		// 可选参数
		const width = this.executeFunctions.getNodeParameter('width', this.itemIndex) as number;
		if (width !== undefined && width !== null) {
			input.width = width;
		}

		const height = this.executeFunctions.getNodeParameter('height', this.itemIndex) as number;
		if (height !== undefined && height !== null) {
			input.height = height;
		}

		const outputFormat = this.executeFunctions.getNodeParameter('output_format', this.itemIndex) as string;
		if (outputFormat) {
			input.output_format = outputFormat;
		}

		const guidanceScale = this.executeFunctions.getNodeParameter('guidance_scale', this.itemIndex) as number;
		if (guidanceScale !== undefined && guidanceScale !== null) {
			input.guidance_scale = guidanceScale;
		}

		const outputQuality = this.executeFunctions.getNodeParameter('output_quality', this.itemIndex) as number;
		if (outputQuality !== undefined && outputQuality !== null) {
			input.output_quality = outputQuality;
		}

		const numInferenceSteps = this.executeFunctions.getNodeParameter(
			'num_inference_steps',
			this.itemIndex,
		) as number;
		if (numInferenceSteps !== undefined && numInferenceSteps !== null) {
			input.num_inference_steps = numInferenceSteps;
		}

		params.input = input;

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Replicate API 响应格式：
		// {
		//   "id": "...",
		//   "status": "succeeded",
		//   "output": "https://...",
		//   ...
		// }
		const result: IDataObject = {
			prediction_id: response.id,
			status: response.status,
			output: response.output,
		};

		// 保留其他可能有用的字段
		if (response.error) {
			result.error = response.error;
		}
		if (response.metrics) {
			result.metrics = response.metrics;
		}
		if (response.urls) {
			result.urls = response.urls;
		}

		return result;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 异步响应格式与同步相同
		return this.processSyncResponse(response);
	}
}

