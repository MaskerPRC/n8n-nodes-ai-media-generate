import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { BaseFalModel } from '../../shared/baseFalModel';
import type { ModelConfig } from '../../../../shared/baseModel';

export class TextToDialogueModel extends BaseFalModel {
	getConfig(): ModelConfig {
		return {
			name: 'textToDialogue',
			displayName: 'ElevenLabs Text To Dialogue',
			endpoint: '/fal-ai/elevenlabs/text-to-dialogue/eleven-v3',
			supportsSync: true,
			supportsAsync: true,
			modelType: 'video', // 使用 video 类型的超时时间，因为音频生成可能需要较长时间
		};
	}

	getInputSchema(): INodeProperties[] {
		return [
			{
				displayName: 'Dialogue Blocks',
				name: 'inputs',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Dialogue Block',
				},
				default: {},
				required: true,
				description: 'A list of dialogue inputs, each containing text and a voice ID',
				options: [
					{
						name: 'dialogueBlock',
						displayName: 'Dialogue Block',
						values: [
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								typeOptions: {
									rows: 3,
								},
								default: '',
								required: true,
								description: 'The dialogue text to convert to speech',
							},
							{
								displayName: 'Voice',
								name: 'voice',
								type: 'string',
								default: 'Rachel',
								required: true,
								description: 'The name or ID of the voice to use for speech generation',
							},
						],
					},
				],
			},
			{
				displayName: 'Stability',
				name: 'stability',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0.5,
				description:
					'Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion.',
			},
			{
				displayName: 'Use Speaker Boost',
				name: 'use_speaker_boost',
				type: 'boolean',
				default: false,
				description:
					'Whether to boost the similarity to the original speaker. Using this setting requires a slightly higher computational load, which in turn increases latency.',
			},
			{
				displayName: 'Pronunciation Dictionary Locators',
				name: 'pronunciation_dictionary_locators',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Locator',
				},
				default: {},
				description: 'A list of pronunciation dictionary locators (ID, version_id) to be applied to the text. They will be applied in order. You may have up to 3 locators per request',
				options: [
					{
						name: 'locator',
						displayName: 'Locator',
						values: [
							{
								displayName: 'Pronunciation Dictionary ID',
								name: 'pronunciation_dictionary_id',
								type: 'string',
								default: '',
								required: true,
								description: 'The ID of the pronunciation dictionary',
							},
							{
								displayName: 'Version ID',
								name: 'version_id',
								type: 'string',
								default: '',
								description: 'The ID of the version of the pronunciation dictionary. If not provided, the latest version will be used.',
							},
						],
					},
				],
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				description:
					'Random seed for reproducibility. The same seed and the same inputs will produce the same output.',
			},
		];
	}

	async buildRequestParams(): Promise<IDataObject> {
		const params: IDataObject = {};

		// 必需参数：inputs
		const inputsData = this.executeFunctions.getNodeParameter('inputs', this.itemIndex) as {
			dialogueBlock?: Array<{ text: string; voice: string }>;
		};

		if (!inputsData || !inputsData.dialogueBlock || inputsData.dialogueBlock.length === 0) {
			throw new Error('At least one dialogue block is required');
		}

		const inputs = inputsData.dialogueBlock.map((block) => ({
			text: block.text,
			voice: block.voice,
		}));
		params.inputs = inputs;

		// 可选参数：stability
		const stability = this.executeFunctions.getNodeParameter('stability', this.itemIndex) as
			| number
			| undefined;
		if (stability !== undefined && stability !== null) {
			params.stability = stability;
		}

		// 可选参数：use_speaker_boost
		const useSpeakerBoost = this.executeFunctions.getNodeParameter(
			'use_speaker_boost',
			this.itemIndex,
		) as boolean | undefined;
		if (useSpeakerBoost !== undefined && useSpeakerBoost !== null) {
			params.use_speaker_boost = useSpeakerBoost;
		}

		// 可选参数：pronunciation_dictionary_locators
		const pronunciationDictLocatorsData = this.executeFunctions.getNodeParameter(
			'pronunciation_dictionary_locators',
			this.itemIndex,
		) as {
			locator?: Array<{
				pronunciation_dictionary_id: string;
				version_id?: string;
			}>;
		};

		if (
			pronunciationDictLocatorsData &&
			pronunciationDictLocatorsData.locator &&
			pronunciationDictLocatorsData.locator.length > 0
		) {
			const pronunciationDictionaryLocators = pronunciationDictLocatorsData.locator.map(
				(locator) => {
					const locatorObj: IDataObject = {
						pronunciation_dictionary_id: locator.pronunciation_dictionary_id,
					};
					if (locator.version_id) {
						locatorObj.version_id = locator.version_id;
					}
					return locatorObj;
				},
			);
			params.pronunciation_dictionary_locators = pronunciationDictionaryLocators;
		}

		// 可选参数：seed
		const seed = this.executeFunctions.getNodeParameter('seed', this.itemIndex) as
			| number
			| string
			| undefined;
		if (seed !== undefined && seed !== null && seed !== '') {
			params.seed = typeof seed === 'number' ? seed : parseInt(seed as string, 10);
		}

		return params;
	}

	protected processSyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio 和 seed）
		return response;
	}

	protected processAsyncResponse(response: IDataObject): IDataObject {
		// 直接返回原始响应，保留所有字段（包括 audio 和 seed）
		return response;
	}
}

