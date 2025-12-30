import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { BaseGenboModel } from './shared/baseGenboModel';
import { ZImageTurboModel } from './models/zImageTurbo/ZImageTurbo.model';
import { Flux2EditModel } from './models/flux2Edit/Flux2Edit.model';
import { Flux2DevModel } from './models/flux2Dev/Flux2Dev.model';
import { Wan22T2VTurboModel } from './models/wan22T2VTurbo/Wan22T2VTurbo.model';
import { Wan22I2VModel } from './models/wan22I2V/Wan22I2V.model';
import { Wan22T2VModel } from './models/wan22T2V/Wan22T2V.model';
import { InfiniteTalkModel } from './models/infiniteTalk/InfiniteTalk.model';
import { InfiniteTalkVideoModel } from './models/infiniteTalkVideo/InfiniteTalkVideo.model';
import { InfiniteTalkMultiModel } from './models/infiniteTalkMulti/InfiniteTalkMulti.model';
import { SteadyDancerModel } from './models/steadyDancer/SteadyDancer.model';
import { Wan22I2VTurboModel } from './models/wan22I2VTurbo/Wan22I2VTurbo.model';
import { Wan22AnimateMoveModel } from './models/wan22AnimateMove/Wan22AnimateMove.model';
import { Wan22AnimateReplaceModel } from './models/wan22AnimateReplace/Wan22AnimateReplace.model';
import { Wan22I2VSmoothMixModel } from './models/wan22I2VSmoothMix/Wan22I2VSmoothMix.model';
import { IndexTTS2SingleModel } from './models/indexTTS2Single/IndexTTS2Single.model';
import { IndexTTS2MultiModel } from './models/indexTTS2Multi/IndexTTS2Multi.model';
import { SoulXPodcastSingleModel } from './models/soulXPodcastSingle/SoulXPodcastSingle.model';
import { SoulXPodcastMultiModel } from './models/soulXPodcastMulti/SoulXPodcastMulti.model';

export type GenboModelConstructor = new (
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
) => BaseGenboModel;

export const GENBO_MODEL_REGISTRY: Record<string, GenboModelConstructor> = {
	zImageTurbo: ZImageTurboModel as GenboModelConstructor,
	flux2Dev: Flux2DevModel as GenboModelConstructor,
	flux2Edit: Flux2EditModel as GenboModelConstructor,
	wan22T2VTurbo: Wan22T2VTurboModel as GenboModelConstructor,
	wan22I2VTurbo: Wan22I2VTurboModel as GenboModelConstructor,
	wan22T2V: Wan22T2VModel as GenboModelConstructor,
	wan22I2V: Wan22I2VModel as GenboModelConstructor,
	wan22I2VSmoothMix: Wan22I2VSmoothMixModel as GenboModelConstructor,
	wan22AnimateMove: Wan22AnimateMoveModel as GenboModelConstructor,
	wan22AnimateReplace: Wan22AnimateReplaceModel as GenboModelConstructor,
	steadyDancer: SteadyDancerModel as GenboModelConstructor,
	infiniteTalk: InfiniteTalkModel as GenboModelConstructor,
	infiniteTalkVideo: InfiniteTalkVideoModel as GenboModelConstructor,
	infiniteTalkMulti: InfiniteTalkMultiModel as GenboModelConstructor,
	indexTTS2Single: IndexTTS2SingleModel as GenboModelConstructor,
	indexTTS2Multi: IndexTTS2MultiModel as GenboModelConstructor,
	soulXPodcastSingle: SoulXPodcastSingleModel as GenboModelConstructor,
	soulXPodcastMulti: SoulXPodcastMultiModel as GenboModelConstructor,
};

// 模型显示名称映射
const GENBO_MODEL_DISPLAY_NAMES: Record<string, string> = {
	zImageTurbo: 'Z-image-turbo',
	flux2Dev: 'Flux.2-dev',
	flux2Edit: 'Flux.2-edit',
	wan22T2VTurbo: 'Wan2.2-14B-T2V-Turbo',
	wan22I2VTurbo: 'Wan2.2-14B-I2V-Turbo',
	wan22T2V: 'Wan2.2-14B-T2V',
	wan22I2V: 'Wan2.2-14B-I2V',
	wan22I2VSmoothMix: 'Wan2.2-I2V-Smooth-Mix',
	wan22AnimateMove: 'Wan2.2-14B-Animate-move',
	wan22AnimateReplace: 'Wan2.2-14B-Animate-replace',
	steadyDancer: 'SteadyDancer',
	infiniteTalk: 'InfiniteTalk',
	infiniteTalkVideo: 'InfiniteTalk-video',
	infiniteTalkMulti: 'InfiniteTalk Multi',
	indexTTS2Single: 'IndexTTS2 Single',
	indexTTS2Multi: 'IndexTTS2 Multi',
	soulXPodcastSingle: 'SoulX-Podcast-Single',
	soulXPodcastMulti: 'SoulX-Podcast-Multi',
};

export function getGenboModelOptions(): Array<{ name: string; value: string }> {
	return Object.entries(GENBO_MODEL_REGISTRY).map(([value]) => {
		return {
			name: GENBO_MODEL_DISPLAY_NAMES[value] || value,
			value,
		};
	});
}

export function createGenboModel(
	modelName: string,
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
): BaseGenboModel {
	const ModelClass = GENBO_MODEL_REGISTRY[modelName];
	if (!ModelClass) {
		throw new Error(`Genbo Model ${modelName} not found`);
	}
	return new ModelClass(executeFunctions, itemIndex);
}

/**
 * 获取所有模型的属性配置，用于节点定义
 * 为每个属性自动添加 displayOptions，根据模型名称显示/隐藏
 */
export function getAllGenboModelProperties(): INodeProperties[] {
	const allModelProperties: INodeProperties[] = [];

	// 创建一个 mock 的 IExecuteFunctions 对象用于实例化模型
	// 注意：getInputSchema() 方法不依赖 executeFunctions，所以这个 mock 对象不会被实际使用
	const mockExecuteFunctions = {} as IExecuteFunctions;

	// 遍历所有模型，获取每个模型的属性配置
	for (const [modelName, ModelClass] of Object.entries(GENBO_MODEL_REGISTRY)) {
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

