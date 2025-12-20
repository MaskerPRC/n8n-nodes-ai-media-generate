import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class Flux2TrainerModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'flux2Trainer',
			displayName: 'FLUX.2 Trainer (Text To Image)',
			endpoint: '/fal-ai/flux-2-trainer',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'image',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Image Data URL',
				name: 'image_data_url',
				type: 'string',
				default: '',
				required: true,
				description:
					'URL to zip archive with images of a consistent style. Try to use at least 10 images, although more is better. The zip can also contain a text file for each image (e.g., photo.txt). Can be a publicly accessible URL or a base64 data URI.',
			},
			{
				displayName: 'Default Caption',
				name: 'default_caption',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description:
					'Default caption to use when caption files are missing. If not provided and caption files are missing, the training will fail.',
			},
			{
				displayName: 'Training Steps',
				name: 'steps',
				type: 'number',
				default: 1000,
				description: 'Total number of training steps',
			},
			{
				displayName: 'Learning Rate',
				name: 'learning_rate',
				type: 'number',
				typeOptions: {
					numberStepSize: 0.00001,
				},
				default: 0.00005,
				description: 'Learning rate applied to trainable parameters',
			},
			{
				displayName: 'Output LoRA Format',
				name: 'output_lora_format',
				type: 'options',
				options: [
					{
						name: 'FAL',
						value: 'fal',
					},
					{
						name: 'Comfy',
						value: 'comfy',
					},
				],
				default: 'fal',
				description: 'Dictates the naming scheme for the output weights',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数
		const imageDataUrl = this.executeFunctions.getNodeParameter('image_data_url', this.itemIndex) as string;
		if (!imageDataUrl || imageDataUrl.trim() === '') {
			throw new Error('Image Data URL is required');
		}
		params.image_data_url = imageDataUrl.trim();

		// 可选参数
		const defaultCaption = this.executeFunctions.getNodeParameter('default_caption', this.itemIndex) as string;
		if (defaultCaption && defaultCaption.trim() !== '') {
			params.default_caption = defaultCaption.trim();
		}

		const steps = this.executeFunctions.getNodeParameter('steps', this.itemIndex) as number;
		if (steps !== undefined && steps !== null) {
			params.steps = steps;
		}

		const learningRate = this.executeFunctions.getNodeParameter('learning_rate', this.itemIndex) as number;
		if (learningRate !== undefined && learningRate !== null) {
			params.learning_rate = learningRate;
		}

		const outputLoraFormat = this.executeFunctions.getNodeParameter('output_lora_format', this.itemIndex) as string;
		if (outputLoraFormat) {
			params.output_lora_format = outputLoraFormat;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Flux2Trainer 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 diffusers_lora_file 和 config_file）
		return response;
	}
}

