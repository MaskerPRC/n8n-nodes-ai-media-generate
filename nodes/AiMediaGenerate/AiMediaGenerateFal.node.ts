import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { getPlatformConfig } from './shared/platformRegistry';
import { getAllFalModelProperties } from './platforms/fal/modelRegistry';

export class AiMediaGenerateFal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AI Media Generate (FAL)',
		name: 'aiMediaGenerateFal',
		icon: { light: 'file:fal.svg', dark: 'file:fal.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["model"]}}',
		description: 'Generate AI media content (images and videos) using FAL platform',
		defaults: {
			name: 'AI Media Generate (FAL)',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'falApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				noDataExpression: true,
				typeOptions: {
					loadOptionsMethod: 'getModelOptions',
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Interface Type',
				name: 'interfaceType',
				type: 'options',
				noDataExpression: true,
				default: 'async',
				description: 'Select synchronous or asynchronous interface',
				options: [
					{
						name: 'Synchronous',
						value: 'sync',
					},
					{
						name: 'Asynchronous',
						value: 'async',
					},
				],
			},
			...this.getDynamicProperties(),
		],
	};

	/**
	 * 加载 FAL 平台的模型选项
	 */
	async getModelOptions(this: ILoadOptionsFunctions): Promise<Array<{ name: string; value: string }>> {
		// 确保 credentials 已加载，这样 n8n 会检测到依赖并自动刷新
		await this.getCredentials('falApi');

		const platformConfig = getPlatformConfig('fal');
		if (!platformConfig) {
			return [];
		}

		return platformConfig.getModelOptions();
	}

	// 显式声明 methods 属性，确保 n8n 能够找到 loadOptionsMethod
	methods = {
		loadOptions: {
			getModelOptions: async function(this: ILoadOptionsFunctions): Promise<Array<{ name: string; value: string }>> {
				// 确保 credentials 已加载，这样 n8n 会检测到依赖并自动刷新
				await this.getCredentials('falApi');

				const platformConfig = getPlatformConfig('fal');
				if (!platformConfig) {
					return [];
				}

				return platformConfig.getModelOptions();
			},
		},
	};

	private getDynamicProperties(): INodeProperties[] {
		// 从模型注册表中动态获取所有模型的属性配置
		// 每个属性会自动添加 displayOptions，根据模型名称显示/隐藏
		return getAllFalModelProperties();
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const modelName = this.getNodeParameter('model', itemIndex) as string;
				const interfaceType = this.getNodeParameter('interfaceType', itemIndex) as string;

				// 获取 FAL 平台配置
				const platformConfig = getPlatformConfig('fal');
				if (!platformConfig) {
					throw new NodeOperationError(
						this.getNode(),
						'FAL platform is not supported',
						{ itemIndex },
					);
				}

				// 创建模型实例
				const model = platformConfig.createModel(modelName, this, itemIndex);

				// 根据接口类型执行
				let result: INodeExecutionData;
				if (interfaceType === 'sync') {
					result = await model.executeSync();
				} else if (interfaceType === 'async') {
					result = await model.executeAsync();
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown interface type: ${interfaceType}`,
						{ itemIndex },
					);
				}

				returnData.push(result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: { item: itemIndex },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}

