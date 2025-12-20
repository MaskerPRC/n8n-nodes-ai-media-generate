import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class ViduQ2TextToImageModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'viduQ2TextToImage',
			displayName: 'Vidu Text To Image Q2',
			endpoint: '/fal-ai/vidu/q2/text-to-image',
			supportsSync: false,
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
					maxLength: 1500,
				},
				default: '',
				required: true,
				description: 'Text prompt for image generation, max 1500 characters',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
				type: 'options',
				options: [
					{
						name: '16:9',
						value: '16:9',
					},
					{
						name: '9:16',
						value: '9:16',
					},
					{
						name: '1:1',
						value: '1:1',
					},
				],
				default: '16:9',
				description: 'The aspect ratio of the output image',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'Random seed for generation. Leave empty for random seed.',
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

		// 可选参数
		const aspectRatio = this.executeFunctions.getNodeParameter(
			'aspect_ratio',
			this.itemIndex,
		) as string;
		if (aspectRatio) {
			params.aspect_ratio = aspectRatio;
		}

		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// Vidu Q2 Text To Image 不支持同步请求
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}
}

