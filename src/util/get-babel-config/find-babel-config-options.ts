import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";

export interface FindBabelConfigOptions {
	cwd: string;
	babelConfig?: ITypescriptPluginBabelOptions["babelConfig"];
}
