import {IBabelConfig} from "../../plugin/i-babel-options";

export interface IGetBabelConfigResult {
	config(filename: string): IBabelConfig;
	minifyConfig: ((filename: string) => IBabelConfig) | undefined;
	hasMinifyOptions: boolean;
}
