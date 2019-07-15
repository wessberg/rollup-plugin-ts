import {IBabelConfig} from "../../plugin/i-babel-options";

export interface GetBabelConfigResult {
	config(filename: string): IBabelConfig;
	minifyConfig: ((filename: string) => IBabelConfig) | undefined;
	hasMinifyOptions: boolean;
}
