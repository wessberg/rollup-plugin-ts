import {TransformOptions, PluginObj} from "@babel/core";

export interface PluginObject<S = {}> extends PluginObj<S> {
	key: string;
}

export interface FullConfig {
	cwd: string;
	root: string;
	filename: string | undefined;
	babelrc: false;
	configFile: false;
	envName: string;
	sourceMaps: boolean;
	sourceType: TransformOptions["sourceType"];
	passPerPreset: boolean;
	plugins: PluginObject[];
	presets: PluginObject[];
}

export interface GetBabelConfigResult {
	config: FullConfig | undefined;
}

export type BabelConfigFactory = (filename: string) => GetBabelConfigResult;
