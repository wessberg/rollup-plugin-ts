import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {InputOptions, OutputOptions} from "rollup";

export interface IGetForcedBabelOptionsOptions {
	cwd: string;
	pluginOptions: ITypescriptPluginBabelOptions;
	browserslist?: string[];
	rollupInputOptions: InputOptions;
	rollupOutputOptions?: OutputOptions;
}