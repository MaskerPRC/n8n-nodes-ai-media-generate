import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class VibeVoice05bModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'vibevoice05b',
			displayName: 'VibeVoice 0.5b',
			endpoint: '/fal-ai/vibevoice/0.5b',
			supportsSync: false,
			supportsAsync: true,
			modelType: 'audio',
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Script',
				name: 'script',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The script to convert to speech',
			},
			{
				displayName: 'Speaker',
				name: 'speaker',
				type: 'options',
				options: [
					{
						name: 'Carter',
						value: 'Carter',
					},
					{
						name: 'Emma',
						value: 'Emma',
					},
					{
						name: 'Frank',
						value: 'Frank',
					},
					{
						name: 'Grace',
						value: 'Grace',
					},
					{
						name: 'Mike',
						value: 'Mike',
					},
					{
						name: 'Wayne',
						value: 'Wayne',
					},
				],
				default: 'Frank',
				required: true,
				description: 'Voice to use for speaking',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'Random seed for reproducible generation. Leave empty for random seed.',
			},
			{
				displayName: 'CFG Scale',
				name: 'cfg_scale',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberStepSize: 0.1,
				},
				default: 1.3,
				description:
					'CFG (Classifier-Free Guidance) scale for generation. Higher values increase adherence to text. Default value: 1.3',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：script
		const script = this.executeFunctions.getNodeParameter('script', this.itemIndex) as string;
		if (!script) {
			throw new Error('Script is required');
		}
		params.script = script;

		// 必需参数：speaker
		const speaker = this.executeFunctions.getNodeParameter('speaker', this.itemIndex) as string;
		if (!speaker) {
			throw new Error('Speaker is required');
		}
		params.speaker = speaker;

		// 可选参数：seed
		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as number | string;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		// 可选参数：cfg_scale
		const cfgScale = this.executeFunctions.getNodeParameter('cfg_scale', this.itemIndex) as
			| number
			| undefined;
		if (cfgScale !== undefined && cfgScale !== null) {
			params.cfg_scale = cfgScale;
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio, duration, sample_rate, generation_time, rtf）
		return response;
	}
}

