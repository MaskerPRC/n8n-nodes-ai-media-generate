import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { BaseReplicateModel } from './shared/baseReplicateModel';
import { ZImageTurboModel } from './models/zImageTurbo/ZImageTurbo.model';

export type ReplicateModelConstructor = new (
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
) => BaseReplicateModel;

export const REPLICATE_MODEL_REGISTRY: Record<string, ReplicateModelConstructor> = {
	zImageTurbo: ZImageTurboModel as ReplicateModelConstructor,
};

// 模型显示名称映射
const REPLICATE_MODEL_DISPLAY_NAMES: Record<string, string> = {
	zImageTurbo: 'Z-image-turbo',
};

export function getReplicateModelOptions(): Array<{ name: string; value: string }> {
	return Object.entries(REPLICATE_MODEL_REGISTRY).map(([value]) => {
		return {
			name: REPLICATE_MODEL_DISPLAY_NAMES[value] || value,
			value,
		};
	});
}

export function createReplicateModel(
	modelName: string,
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
): BaseReplicateModel {
	const ModelClass = REPLICATE_MODEL_REGISTRY[modelName];
	if (!ModelClass) {
		throw new Error(`Replicate Model ${modelName} not found`);
	}
	return new ModelClass(executeFunctions, itemIndex);
}

/**
 * 获取所有模型的属性配置，用于节点定义
 * 为每个属性自动添加 displayOptions，根据模型名称显示/隐藏
 */
export function getAllReplicateModelProperties(): INodeProperties[] {
	const allModelProperties: INodeProperties[] = [];

	// 创建一个 mock 的 IExecuteFunctions 对象用于实例化模型
	// 注意：getInputSchema() 方法不依赖 executeFunctions，所以这个 mock 对象不会被实际使用
	const mockExecuteFunctions = {} as IExecuteFunctions;

	// 遍历所有模型，获取每个模型的属性配置
	for (const [modelName, ModelClass] of Object.entries(REPLICATE_MODEL_REGISTRY)) {
		// 创建临时实例以调用 getInputSchema()
		const tempModel = new ModelClass(mockExecuteFunctions, 0);
		const modelProperties = tempModel.getInputSchema();

		// 为每个属性添加 displayOptions，根据模型名称显示/隐藏
		const propertiesWithDisplayOptions = modelProperties.map((property) => {
			// 如果属性已经有 displayOptions，需要合并而不是覆盖
			// 这样可以保留模型类中定义的 displayOptions（如 image_size: ['custom']）
			if (property.displayOptions?.show) {
				return {
					...property,
					displayOptions: {
						...property.displayOptions,
						show: {
							...property.displayOptions.show,
							model: [modelName],
						},
					},
				};
			} else {
				return {
					...property,
					displayOptions: {
						show: {
							model: [modelName],
						},
					},
				};
			}
		});

		allModelProperties.push(...propertiesWithDisplayOptions);
	}

	return allModelProperties;
}

