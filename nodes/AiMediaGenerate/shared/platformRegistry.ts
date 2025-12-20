import type { IExecuteFunctions } from 'n8n-workflow';
import type { BaseModel } from './baseModel';
import { getFalModelOptions, createFalModel } from '../platforms/fal/modelRegistry';
import { getGenboModelOptions, createGenboModel } from '../platforms/genbo/modelRegistry';
import { getReplicateModelOptions, createReplicateModel } from '../platforms/replicate/modelRegistry';

export interface PlatformConfig {
	name: string;
	displayName: string;
	credentialName: string;
	getModelOptions: () => Array<{ name: string; value: string }>;
	createModel: (
		modelName: string,
		executeFunctions: IExecuteFunctions,
		itemIndex: number,
	) => BaseModel;
}

export const PLATFORM_REGISTRY: Record<string, PlatformConfig> = {
	fal: {
		name: 'fal',
		displayName: 'FAL',
		credentialName: 'falApi',
		getModelOptions: getFalModelOptions,
		createModel: createFalModel as (
			modelName: string,
			executeFunctions: IExecuteFunctions,
			itemIndex: number,
		) => BaseModel,
	},
	genbo: {
		name: 'genbo',
		displayName: 'Genbo',
		credentialName: 'genboApi',
		getModelOptions: getGenboModelOptions,
		createModel: createGenboModel as (
			modelName: string,
			executeFunctions: IExecuteFunctions,
			itemIndex: number,
		) => BaseModel,
	},
	replicate: {
		name: 'replicate',
		displayName: 'Replicate',
		credentialName: 'replicateApi',
		getModelOptions: getReplicateModelOptions,
		createModel: createReplicateModel as (
			modelName: string,
			executeFunctions: IExecuteFunctions,
			itemIndex: number,
		) => BaseModel,
	},
};

export function getPlatformOptions(): Array<{ name: string; value: string }> {
	return Object.values(PLATFORM_REGISTRY).map((platform) => ({
		name: platform.displayName,
		value: platform.name,
	}));
}

export function getPlatformConfig(platformName: string): PlatformConfig | undefined {
	return PLATFORM_REGISTRY[platformName];
}

