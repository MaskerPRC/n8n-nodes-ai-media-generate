import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { getPlatformOptions, getPlatformConfig } from './shared/platformRegistry';

export class AiMediaGenerate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AI Media Generate',
		name: 'aiMediaGenerate',
		icon: { light: 'file:ai-media.svg', dark: 'file:ai-media.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["platform"] + " - " + $parameter["model"]}}',
		description: 'Generate AI media content (images and videos) using various platforms',
		defaults: {
			name: 'AI Media Generate',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'falApi',
				required: true,
				displayOptions: {
					show: {
						platform: ['fal'],
					},
				},
			},
			{
				name: 'genboApi',
				required: true,
				displayOptions: {
					show: {
						platform: ['genbo'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				noDataExpression: true,
				options: getPlatformOptions(),
				default: '',
				description: 'Select the AI platform to use',
			},
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				noDataExpression: true,
				typeOptions: {
					loadOptionsMethod: 'getModelOptions',
					loadOptionsDependOn: ['platform'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						platform: ['fal', 'genbo'],
					},
				},
			},
			{
				displayName: 'Interface Type',
				name: 'interfaceType',
				type: 'options',
				noDataExpression: true,
				default: 'async',
				description: 'Select synchronous or asynchronous interface',
				displayOptions: {
					show: {
						platform: ['fal', 'genbo'],
					},
				},
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
	 * 根据选择的平台动态加载模型选项
	 * 这是 n8n 的 loadOptionsMethod，会根据当前节点的参数值动态返回选项
	 * 主动获取 credentials 以确保在 credentials 改变时触发刷新
	 * n8n 前端会监听 credentials 的变化并自动刷新 loadOptions
	 */
	async getModelOptions(this: ILoadOptionsFunctions): Promise<Array<{ name: string; value: string }>> {
		const platform = this.getNodeParameter('platform', 0) as string;
		
		if (!platform) {
			// 如果还没有选择平台，返回空数组
			return [];
		}

		// 主动获取 credentials 以确保在 credentials 改变时触发刷新
		// n8n 前端会监听 node.value?.credentials 的变化，当 credentials 改变时会自动调用 loadRemoteParameterOptions
		// 通过在 loadOptionsMethod 中调用 getCredentials，我们确保 n8n 知道这个 loadOptions 依赖于 credentials
		if (platform === 'fal') {
			await this.getCredentials('falApi');
		} else if (platform === 'genbo') {
			await this.getCredentials('genboApi');
		}

		// 根据平台返回对应的模型选项
		const platformConfig = getPlatformConfig(platform);
		if (!platformConfig) {
			return [];
		}

		return platformConfig.getModelOptions();
	}

	// 显式声明 methods 属性，确保 n8n 能够找到 loadOptionsMethod
	methods = {
		loadOptions: {
			getModelOptions: async function(this: ILoadOptionsFunctions): Promise<Array<{ name: string; value: string }>> {
				const platform = this.getNodeParameter('platform', 0) as string;
				
				if (!platform) {
					return [];
				}

				// 主动获取 credentials 以确保在 credentials 改变时触发刷新
				// n8n 前端会监听 node.value?.credentials 的变化，当 credentials 改变时会自动调用 loadRemoteParameterOptions
				// 通过在 loadOptionsMethod 中调用 getCredentials，我们确保 n8n 知道这个 loadOptions 依赖于 credentials
				if (platform === 'fal') {
					await this.getCredentials('falApi');
				} else if (platform === 'genbo') {
					await this.getCredentials('genboApi');
				}

				const platformConfig = getPlatformConfig(platform);
				if (!platformConfig) {
					return [];
				}

				return platformConfig.getModelOptions();
			},
		},
	};

	private getDynamicProperties(): INodeProperties[] {
		// 返回所有模型的输入属性，使用 displayOptions 来控制显示
		const allModelProperties: INodeProperties[] = [];

		// FAL 平台 - WAN 2.6 I2V 模型的属性
		allModelProperties.push(
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description: 'The text prompt describing the desired video motion. Max 800 characters.',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description:
					'URL of the image to use as the first frame. Must be publicly accessible or base64 data URI. Image dimensions must be between 240 and 7680.',
			},
			{
				displayName: 'Audio URL',
				name: 'audio_url',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description:
					'URL of the audio to use as the background music. Must be publicly accessible. Format: WAV, MP3. Duration: 3 to 30s. File size: Up to 15MB.',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '720p',
						value: '720p',
					},
					{
						name: '1080p',
						value: '1080p',
					},
				],
				default: '1080p',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description: 'Video resolution',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: [
					{
						name: '5 Seconds',
						value: '5',
					},
					{
						name: '10 Seconds',
						value: '10',
					},
					{
						name: '15 Seconds',
						value: '15',
					},
				],
				default: '5',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description: 'Duration of the generated video in seconds',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negative_prompt',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description: 'Negative prompt to describe content to avoid. Max 500 characters.',
			},
			{
				displayName: 'Enable Prompt Expansion',
				name: 'enable_prompt_expansion',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description: 'Whether to enable prompt rewriting using LLM',
			},
			{
				displayName: 'Multi Shots',
				name: 'multi_shots',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description:
					'Whether to enable intelligent multi-shot segmentation. Only active when enable_prompt_expansion is True.',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description: 'Random seed for reproducibility. Leave empty for random seed.',
			},
			{
				displayName: 'Enable Safety Checker',
				name: 'enable_safety_checker',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['wan26i2v'],
					},
				},
				description: 'Whether to enable the safety checker',
			},
		);

		// FAL 平台 - Gemini 3 Pro Image 模型的属性
		allModelProperties.push(
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description: 'The prompt for image editing',
			},
			{
				displayName: 'Image URLs',
				name: 'image_urls',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Image URL',
				},
				default: '',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description:
					'The URLs of the images to use for image-to-image generation or image editing. Can be publicly accessible URLs or base64 data URIs. Click "Add Image URL" to add multiple images.',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description: 'The number of images to generate',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
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
						name: '2:3',
						value: '2:3',
					},
					{
						name: '21:9',
						value: '21:9',
					},
					{
						name: '3:2',
						value: '3:2',
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
						name: '4:5',
						value: '4:5',
					},
					{
						name: '5:4',
						value: '5:4',
					},
					{
						name: '9:16',
						value: '9:16',
					},
					{
						name: 'Auto',
						value: 'auto',
					},
				],
				default: 'auto',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description: 'The aspect ratio of the generated image',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{
						name: 'JPEG',
						value: 'jpeg',
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
				default: 'png',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description: 'The format of the generated image',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '1K',
						value: '1K',
					},
					{
						name: '2K',
						value: '2K',
					},
					{
						name: '4K',
						value: '4K',
					},
				],
				default: '1K',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description: 'The resolution of the image to generate',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description: 'Whether to return the media as a data URI. If True, the output data won\'t be available in the request history.',
			},
			{
				displayName: 'Limit Generations',
				name: 'limit_generations',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description:
					'Whether to limit the number of generations from each round of prompting to 1. This is an experimental parameter.',
			},
			{
				displayName: 'Enable Web Search',
				name: 'enable_web_search',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImage'],
					},
				},
				description: 'Whether to enable web search for the image generation task. This will allow the model to use the latest information from the web to generate the image.',
			},
		);

		// FAL 平台 - Gemini 3 Pro Image T2I (Text-to-Image) 模型的属性
		allModelProperties.push(
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description: 'The text prompt to generate an image from',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description: 'The number of images to generate',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspect_ratio',
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
						name: '2:3',
						value: '2:3',
					},
					{
						name: '21:9',
						value: '21:9',
					},
					{
						name: '3:2',
						value: '3:2',
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
						name: '4:5',
						value: '4:5',
					},
					{
						name: '5:4',
						value: '5:4',
					},
					{
						name: '9:16',
						value: '9:16',
					},
				],
				default: '1:1',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description: 'The aspect ratio of the generated image',
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{
						name: 'JPEG',
						value: 'jpeg',
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
				default: 'png',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description: 'The format of the generated image',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '1K',
						value: '1K',
					},
					{
						name: '2K',
						value: '2K',
					},
					{
						name: '4K',
						value: '4K',
					},
				],
				default: '1K',
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description: 'The resolution of the image to generate',
			},
			{
				displayName: 'Sync Mode',
				name: 'sync_mode',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description: 'Whether to return the media as a data URI. If True, the output data won\'t be available in the request history.',
			},
			{
				displayName: 'Limit Generations',
				name: 'limit_generations',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description:
					'Whether to limit the number of generations from each round of prompting to 1. This is an experimental parameter.',
			},
			{
				displayName: 'Enable Web Search',
				name: 'enable_web_search',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						platform: ['fal'],
						model: ['gemini3ProImageT2I'],
					},
				},
				description: 'Whether to enable web search for the image generation task. This will allow the model to use the latest information from the web to generate the image.',
			},
		);

		// Genbo 平台 - Z-image-turbo 模型的属性
		allModelProperties.push(
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						platform: ['genbo'],
						model: ['zImageTurbo'],
					},
				},
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
				default: '16:9',
				displayOptions: {
					show: {
						platform: ['genbo'],
						model: ['zImageTurbo'],
					},
				},
				description: 'The aspect ratio of the generated image',
			},
			{
				displayName: 'Number of Images',
				name: 'num_images',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						platform: ['genbo'],
						model: ['zImageTurbo'],
					},
				},
				description: 'The number of images to generate',
			},
			{
				displayName: 'Number of Inference Steps',
				name: 'num_inference_steps',
				type: 'number',
				default: 9,
				displayOptions: {
					show: {
						platform: ['genbo'],
						model: ['zImageTurbo'],
					},
				},
				description: 'The number of inference steps (default: 9)',
			},
		);

		return allModelProperties;
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const platformName = this.getNodeParameter('platform', itemIndex) as string;
				const modelName = this.getNodeParameter('model', itemIndex) as string;
				const interfaceType = this.getNodeParameter('interfaceType', itemIndex) as string;

				// 获取平台配置
				const platformConfig = getPlatformConfig(platformName);
				if (!platformConfig) {
					throw new NodeOperationError(
						this.getNode(),
						`Platform ${platformName} is not supported`,
						{ itemIndex },
					);
				}

				// 创建模型实例（模型构造函数会检查 credentials）
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

