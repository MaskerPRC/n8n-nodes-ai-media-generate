import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from './shared/baseFalModel';
import { Wan26I2VModel } from './models/wan26i2v/Wan26I2V.model';
import { Wan26T2VModel } from './models/wan26t2v/Wan26T2V.model';
import { Wan26R2VModel } from './models/wan26r2v/Wan26R2V.model';
import { Gemini25FlashImageModel } from './models/gemini25FlashImage/Gemini25FlashImage.model';
import { Gemini3ProImageModel } from './models/gemini3ProImage/Gemini3ProImage.model';
import { Gemini3ProImageT2IModel } from './models/gemini3ProImageT2I/Gemini3ProImageT2I.model';
import { SeedDream45EditModel } from './models/seedDream45Edit/SeedDream45Edit.model';
import { Seedream45Model } from './models/seedream45/Seedream45.model';
import { ZImageTurboModel } from './models/zImageTurbo/ZImageTurbo.model';
import { QwenImageLayeredModel } from './models/qwenImageLayered/QwenImageLayered.model';
import { Flux1DevModel } from './models/flux1Dev/Flux1Dev.model';
import { Flux1DevI2IModel } from './models/flux1DevI2I/Flux1DevI2I.model';
import { Flux2EditModel } from './models/flux2Edit/Flux2Edit.model';
import { Flux2ProModel } from './models/flux2Pro/Flux2Pro.model';
import { Flux2ProEditModel } from './models/flux2ProEdit/Flux2ProEdit.model';
import { Flux2DevModel } from './models/flux2Dev/Flux2Dev.model';
import { Flux2MaxModel } from './models/flux2Max/Flux2Max.model';
import { Flux2MaxEditModel } from './models/flux2MaxEdit/Flux2MaxEdit.model';
import { Flux2TrainerEditModel } from './models/flux2TrainerEdit/Flux2TrainerEdit.model';
import { Flux2TrainerModel } from './models/flux2Trainer/Flux2Trainer.model';
import { Flux2FlexModel } from './models/flux2Flex/Flux2Flex.model';
import { Flux2FlexEditModel } from './models/flux2FlexEdit/Flux2FlexEdit.model';
import { GptImage15Model } from './models/gptImage15/GptImage15.model';
import { KlingV26ProI2VModel } from './models/klingV26ProI2V/KlingV26ProI2V.model';
import { KlingV26ProModel } from './models/klingV26Pro/KlingV26Pro.model';
import { KlingCreateVoiceModel } from './models/klingCreateVoice/KlingCreateVoice.model';
import { TextToDialogueModel } from './models/textToDialogue/TextToDialogue.model';
import { ElevenLabsAudioIsolationModel } from './models/elevenlabsAudioIsolation/ElevenLabsAudioIsolation.model';
import { ElevenlabsTtsMultilingualV2Model } from './models/elevenlabsTtsMultilingualV2/ElevenlabsTtsMultilingualV2.model';
import { ElevenlabsTtsV3Model } from './models/elevenlabsTtsV3/ElevenlabsTtsV3.model';
import { ElevenlabsTtsTurboV25Model } from './models/elevenlabsTtsTurboV25/ElevenlabsTtsTurboV25.model';
import { ElevenLabsSoundEffectsV2Model } from './models/elevenLabsSoundEffectsV2/ElevenLabsSoundEffectsV2.model';
import { MinimaxVoiceCloneModel } from './models/minimaxVoiceClone/MinimaxVoiceClone.model';
import { MinimaxSpeech26HdModel } from './models/minimaxSpeech26Hd/MinimaxSpeech26Hd.model';
import { MinimaxSpeech26TurboModel } from './models/minimaxSpeech26Turbo/MinimaxSpeech26Turbo.model';
import { TextToMusicV2Model } from './models/textToMusicV2/TextToMusicV2.model';
import { MinimaxVoiceDesignModel } from './models/minimaxVoiceDesign/MinimaxVoiceDesign.model';
import { Moondream3PreviewCaptionModel } from './models/moondream3PreviewCaption/Moondream3PreviewCaption.model';
import { OpenRouterVisionModel } from './models/openrouterVision/OpenRouterVision.model';
import { Moondream3PreviewDetectModel } from './models/moondream3PreviewDetect/Moondream3PreviewDetect.model';
import { Moondream3PreviewPointModel } from './models/moondream3PreviewPoint/Moondream3PreviewPoint.model';
import { ViduQ2TextToImageModel } from './models/viduQ2TextToImage/ViduQ2TextToImage.model';
import { Q2ReferenceToVideoModel } from './models/q2ReferenceToVideo/Q2ReferenceToVideo.model';
import { Q2ImageToVideoProModel } from './models/q2ImageToVideoPro/Q2ImageToVideoPro.model';
import { Q2VideoExtensionProModel } from './models/q2VideoExtensionPro/Q2VideoExtensionPro.model';
import { Q2TextToVideoModel } from './models/q2TextToVideo/Q2TextToVideo.model';
import { Q2ReferenceToImageModel } from './models/q2ReferenceToImage/Q2ReferenceToImage.model';
import { VeedLipsyncModel } from './models/veedLipsync/VeedLipsync.model';
import { VeedVideoBackgroundRemovalFastModel } from './models/veedVideoBackgroundRemovalFast/VeedVideoBackgroundRemovalFast.model';
import { VeedVideoBackgroundRemovalModel } from './models/veedVideoBackgroundRemoval/VeedVideoBackgroundRemoval.model';
import { Fabric1FastModel } from './models/fabric1Fast/Fabric1Fast.model';
import { VeedFabric1TextModel } from './models/veedFabric1Text/VeedFabric1Text.model';
import { VeedFabric1Model } from './models/veedFabric1/VeedFabric1.model';
import { AuroraModel } from './models/aurora/Aurora.model';
import { BriaVideoEraserEraseByPromptModel } from './models/briaVideoEraserEraseByPrompt/BriaVideoEraserEraseByPrompt.model';
import { BriaVideoEraserEraseByMaskModel } from './models/briaVideoEraserEraseByMask/BriaVideoEraserEraseByMask.model';
import { BriaVideoEraserKeypointsModel } from './models/briaVideoEraserKeypoints/BriaVideoEraserKeypoints.model';
import { CreatifyLipsyncModel } from './models/creatifyLipsync/CreatifyLipsync.model';
import { TopazVideoUpscaleModel } from './models/topazVideoUpscale/TopazVideoUpscale.model';
import { TopazUpscaleImageModel } from './models/topazUpscaleImage/TopazUpscaleImage.model';
import { ChatterboxTurboTtsModel } from './models/chatterboxTurboTts/ChatterboxTurboTts.model';
import { VibeVoice05bModel } from './models/vibevoice05b/VibeVoice05b.model';
import { Veo31ReferenceToVideoModel } from './models/veo31ReferenceToVideo/Veo31ReferenceToVideo.model';
import { Moondream3PreviewModel } from './models/moondream3Preview/Moondream3Preview.model';
import { BagelUnderstandModel } from './models/bagelUnderstand/BagelUnderstand.model';
import { Sam3ImageEmbedModel } from './models/sam3ImageEmbed/Sam3ImageEmbed.model';
import { Sam3VideoRleModel } from './models/sam3VideoRle/Sam3VideoRle.model';
import { Sam3ImageRleModel } from './models/sam3ImageRle/Sam3ImageRle.model';
import { Sam3VideoModel } from './models/sam3Video/Sam3Video.model';
import { Sam3ImageModel } from './models/sam3Image/Sam3Image.model';
import { Veo31FastExtendVideoModel } from './models/veo31FastExtendVideo/Veo31FastExtendVideo.model';
import { Veo31ExtendVideoModel } from './models/veo31ExtendVideo/Veo31ExtendVideo.model';
import { Veo31FastModel } from './models/veo31Fast/Veo31Fast.model';
import { Veo31FastI2VModel } from './models/veo31FastI2V/Veo31FastI2V.model';
import { Veo31FastFirstLastFrameToVideoModel } from './models/veo31FastFirstLastFrameToVideo/Veo31FastFirstLastFrameToVideo.model';
import { Veo31I2VModel } from './models/veo31I2V/Veo31I2V.model';
import { Veo31FirstLastFrameToVideoModel } from './models/veo31FirstLastFrameToVideo/Veo31FirstLastFrameToVideo.model';
import { Veo31Model } from './models/veo31/Veo31.model';

export type FalModelConstructor = new (
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
) => BaseFalModel;

export const FAL_MODEL_REGISTRY: Record<string, FalModelConstructor> = {
	wan26i2v: Wan26I2VModel as FalModelConstructor,
	wan26t2v: Wan26T2VModel as FalModelConstructor,
	wan26r2v: Wan26R2VModel as FalModelConstructor,
	gemini3ProImage: Gemini3ProImageModel as FalModelConstructor,
	gemini3ProImageT2I: Gemini3ProImageT2IModel as FalModelConstructor,
	gemini25FlashImage: Gemini25FlashImageModel as FalModelConstructor,
	seedream45: Seedream45Model as FalModelConstructor,
	seedDream45Edit: SeedDream45EditModel as FalModelConstructor,
	zImageTurbo: ZImageTurboModel as FalModelConstructor,
	qwenImageLayered: QwenImageLayeredModel as FalModelConstructor,
	flux1Dev: Flux1DevModel as FalModelConstructor,
	flux1DevI2I: Flux1DevI2IModel as FalModelConstructor,
	flux2Edit: Flux2EditModel as FalModelConstructor,
	flux2Pro: Flux2ProModel as FalModelConstructor,
	flux2ProEdit: Flux2ProEditModel as FalModelConstructor,
	flux2Dev: Flux2DevModel as FalModelConstructor,
	flux2Max: Flux2MaxModel as FalModelConstructor,
	flux2MaxEdit: Flux2MaxEditModel as FalModelConstructor,
	flux2TrainerEdit: Flux2TrainerEditModel as FalModelConstructor,
	flux2Trainer: Flux2TrainerModel as FalModelConstructor,
	flux2Flex: Flux2FlexModel as FalModelConstructor,
	flux2FlexEdit: Flux2FlexEditModel as FalModelConstructor,
	gptImage15: GptImage15Model as FalModelConstructor,
	klingV26ProI2V: KlingV26ProI2VModel as FalModelConstructor,
	klingV26Pro: KlingV26ProModel as FalModelConstructor,
	klingCreateVoice: KlingCreateVoiceModel as FalModelConstructor,
	textToDialogue: TextToDialogueModel as FalModelConstructor,
	elevenlabsTtsMultilingualV2: ElevenlabsTtsMultilingualV2Model as FalModelConstructor,
	elevenlabsTtsV3: ElevenlabsTtsV3Model as FalModelConstructor,
	elevenlabsTtsTurboV25: ElevenlabsTtsTurboV25Model as FalModelConstructor,
	elevenLabsSoundEffectsV2: ElevenLabsSoundEffectsV2Model as FalModelConstructor,
	elevenlabsAudioIsolation: ElevenLabsAudioIsolationModel as FalModelConstructor,
	minimaxSpeech26Hd: MinimaxSpeech26HdModel as FalModelConstructor,
	minimaxSpeech26Turbo: MinimaxSpeech26TurboModel as FalModelConstructor,
	textToMusicV2: TextToMusicV2Model as FalModelConstructor,
	minimaxVoiceClone: MinimaxVoiceCloneModel as FalModelConstructor,
	minimaxVoiceDesign: MinimaxVoiceDesignModel as FalModelConstructor,
	openrouterVision: OpenRouterVisionModel as FalModelConstructor,
	moondream3PreviewCaption: Moondream3PreviewCaptionModel as FalModelConstructor,
	moondream3PreviewDetect: Moondream3PreviewDetectModel as FalModelConstructor,
	moondream3PreviewPoint: Moondream3PreviewPointModel as FalModelConstructor,
	viduQ2TextToImage: ViduQ2TextToImageModel as FalModelConstructor,
	q2ReferenceToVideo: Q2ReferenceToVideoModel as FalModelConstructor,
	q2ImageToVideoPro: Q2ImageToVideoProModel as FalModelConstructor,
	q2TextToVideo: Q2TextToVideoModel as FalModelConstructor,
	q2VideoExtensionPro: Q2VideoExtensionProModel as FalModelConstructor,
	q2ReferenceToImage: Q2ReferenceToImageModel as FalModelConstructor,
	veedLipsync: VeedLipsyncModel as FalModelConstructor,
	veedVideoBackgroundRemoval: VeedVideoBackgroundRemovalModel as FalModelConstructor,
	veedVideoBackgroundRemovalFast: VeedVideoBackgroundRemovalFastModel as FalModelConstructor,
	fabric1Fast: Fabric1FastModel as FalModelConstructor,
	veedFabric1Text: VeedFabric1TextModel as FalModelConstructor,
	veedFabric1: VeedFabric1Model as FalModelConstructor,
	creatifyLipsync: CreatifyLipsyncModel as FalModelConstructor,
	aurora: AuroraModel as FalModelConstructor,
	briaVideoEraserEraseByPrompt: BriaVideoEraserEraseByPromptModel as FalModelConstructor,
	briaVideoEraserEraseByMask: BriaVideoEraserEraseByMaskModel as FalModelConstructor,
	briaVideoEraserKeypoints: BriaVideoEraserKeypointsModel as FalModelConstructor,
	topazVideoUpscale: TopazVideoUpscaleModel as FalModelConstructor,
	topazUpscaleImage: TopazUpscaleImageModel as FalModelConstructor,
	vibevoice05b: VibeVoice05bModel as FalModelConstructor,
	veo31ReferenceToVideo: Veo31ReferenceToVideoModel as FalModelConstructor,
	chatterboxTurboTts: ChatterboxTurboTtsModel as FalModelConstructor,
	moondream3Preview: Moondream3PreviewModel as FalModelConstructor,
	bagelUnderstand: BagelUnderstandModel as FalModelConstructor,
	sam3ImageEmbed: Sam3ImageEmbedModel as FalModelConstructor,
	sam3ImageRle: Sam3ImageRleModel as FalModelConstructor,
	sam3Video: Sam3VideoModel as FalModelConstructor,
	sam3Image: Sam3ImageModel as FalModelConstructor,
	sam3VideoRle: Sam3VideoRleModel as FalModelConstructor,
	veo31FastExtendVideo: Veo31FastExtendVideoModel as FalModelConstructor,
	veo31ExtendVideo: Veo31ExtendVideoModel as FalModelConstructor,
	veo31Fast: Veo31FastModel as FalModelConstructor,
	veo31FastI2V: Veo31FastI2VModel as FalModelConstructor,
	veo31FastFirstLastFrameToVideo: Veo31FastFirstLastFrameToVideoModel as FalModelConstructor,
	veo31I2V: Veo31I2VModel as FalModelConstructor,
	veo31FirstLastFrameToVideo: Veo31FirstLastFrameToVideoModel as FalModelConstructor,
	veo31: Veo31Model as FalModelConstructor,
};

// 模型显示名称映射
const FAL_MODEL_DISPLAY_NAMES: Record<string, string> = {
	wan26i2v: 'WAN 2.6 Image-to-Video',
	wan26t2v: 'WAN 2.6 Text-to-Video',
	wan26r2v: 'WAN 2.6 Reference-to-Video',
	gemini25FlashImage: 'Gemini 2.5 Flash Image',
	gemini3ProImage: 'Gemini 3 Pro Image (Edit)',
	gemini3ProImageT2I: 'Gemini 3 Pro Image (Text-to-Image)',
	seedream45: 'Seedream 4.5',
	seedDream45Edit: 'SeedDream 4.5 Edit',
	zImageTurbo: 'Z-Image Turbo',
	qwenImageLayered: 'Qwen Image Layered',
	flux1Dev: 'FLUX.1 [dev]',
	flux1DevI2I: 'FLUX.1 [dev] Image-to-Image',
	flux2Edit: 'FLUX.2 [dev] Edit',
	flux2Pro: 'FLUX.2 Pro',
	flux2ProEdit: 'FLUX.2 Pro Edit',
	flux2Dev: 'FLUX.2 [dev]',
	flux2Max: 'FLUX.2 Max',
	flux2MaxEdit: 'FLUX.2 Max Edit',
	flux2Trainer: 'FLUX.2 Trainer (Text To Image)',
	flux2TrainerEdit: 'FLUX.2 Trainer Edit',
	flux2Flex: 'FLUX.2 Flex',
	flux2FlexEdit: 'FLUX.2 Flex Edit',
	gptImage15: 'GPT Image 1.5 (Edit)',
	klingV26ProI2V: 'Kling V2.6 Pro Image-to-Video',
	klingV26Pro: 'Kling V2.6 Pro (Text-to-Video)',
	klingCreateVoice: 'Kling Create Voice',
	textToDialogue: 'ElevenLabs Text To Dialogue',
	elevenlabsTtsMultilingualV2: 'ElevenLabs Multilingual v2',
	elevenlabsTtsV3: 'ElevenLabs TTS V3',
	elevenlabsTtsTurboV25: 'ElevenLabs Turbo v2.5',
	elevenLabsSoundEffectsV2: 'ElevenLabs Sound Effects V2',
	elevenlabsAudioIsolation: 'ElevenLabs Audio Isolation',
	minimaxSpeech26Hd: 'MiniMax Text To Speech 2.6 HD',
	minimaxSpeech26Turbo: 'MiniMax Text To Speech 2.6 Turbo',
	minimaxVoiceDesign: 'MiniMax Voice Design',
	openrouterVision: 'OpenRouter Vision (VLM)',
	minimaxVoiceClone: 'MiniMax Voice Clone',
	textToMusicV2: 'MiniMax Text To Music V2',
	moondream3PreviewCaption: 'Moondream 3 Preview Caption',
	moondream3PreviewDetect: 'Moondream 3 Preview Detect',
	moondream3PreviewPoint: 'Moondream 3 Preview Point Object Detection',
	viduQ2TextToImage: 'Vidu Text To Image Q2',
	q2ReferenceToVideo: 'Vidu Q2 ReferenceToVideo',
	q2ImageToVideoPro: 'Vidu Q2 Image To Video Pro',
	q2VideoExtensionPro: 'Vidu Q2Video Extension Pro',
	q2TextToVideo: 'Vidu Q2 Text To Video',
	q2ReferenceToImage: 'Vidu Reference To Image Q2',
	veedLipsync: 'VEED Lipsync',
	veedVideoBackgroundRemoval: 'Veed Video Background Removal',
	veedVideoBackgroundRemovalFast: 'VEED Video Background Removal Fast',
	fabric1Fast: 'VEED Fabric 1.0 Fast',
	veedFabric1Text: 'VEED Fabric-One Text',
	veedFabric1: 'VEED Fabric 1.0',
	creatifyLipsync: 'Creatify Lipsync',
	aurora: 'Aurora',
	briaVideoEraserEraseByPrompt: 'Bria Video Eraser (Erase By Prompt)',
	briaVideoEraserEraseByMask: 'Bria Video Eraser - Erase By Mask',
	briaVideoEraserKeypoints: 'Bria Video Eraser (Erase By Keypoints)',
	topazVideoUpscale: 'Topaz Video AI Upscale',
	topazUpscaleImage: 'Topaz Upscale Image',
	chatterboxTurboTts: 'Chatterbox Turbo TTS',
	vibevoice05b: 'VibeVoice 0.5b',
	moondream3Preview: 'Moondream 3 Preview (Query)',
	bagelUnderstand: 'Bagel Understand',
	sam3ImageEmbed: 'SAM 3 Image Embedding',
	sam3ImageRle: 'SAM 3 Image RLE',
	sam3Video: 'Segment Video Simple',
	sam3Image: 'SAM-3 Image Segmentation',
	sam3VideoRle: 'SAM 3 Video RLE',
	veo31FastExtendVideo: 'Veo 3.1 Fast Extend Video',
	veo31Fast: 'Veo 3.1 Fast',
	veo31FastI2V: 'Veo 3.1 Fast Image-to-Video',
	veo31FastFirstLastFrameToVideo: 'Veo 3.1 Fast First-Last-Frame-to-Video',
	veo31ExtendVideo: 'Veo 3.1 Extend Video',
	veo31I2V: 'Veo 3.1 Image-to-Video',
	veo31FirstLastFrameToVideo: 'Veo 3.1 First-Last-Frame-to-Video',
	veo31: 'Veo 3.1',
};

export function getFalModelOptions(): Array<{ name: string; value: string }> {
	return Object.entries(FAL_MODEL_REGISTRY).map(([value]) => {
		return {
			name: FAL_MODEL_DISPLAY_NAMES[value] || value,
			value,
		};
	});
}

export function createFalModel(
	modelName: string,
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
): BaseFalModel {
	const ModelClass = FAL_MODEL_REGISTRY[modelName];
	if (!ModelClass) {
		throw new Error(`FAL Model ${modelName} not found`);
	}
	return new ModelClass(executeFunctions, itemIndex);
}

/**
 * 获取所有模型的属性配置，用于节点定义
 * 为每个属性自动添加 displayOptions，根据模型名称显示/隐藏
 */
export function getAllFalModelProperties(): INodeProperties[] {
	const allModelProperties: INodeProperties[] = [];

	// 创建一个 mock 的 IExecuteFunctions 对象用于实例化模型
	// 注意：getInputSchema() 方法不依赖 executeFunctions，所以这个 mock 对象不会被实际使用
	const mockExecuteFunctions = {} as IExecuteFunctions;

	// 遍历所有模型，获取每个模型的属性配置
	for (const [modelName, ModelClass] of Object.entries(FAL_MODEL_REGISTRY)) {
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

