import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {InputOptions, OutputOptions} from "rollup";

export interface IGetDefaultBabelOptionsOptions {
	pluginOptions: ITypescriptPluginBabelOptions;
	browserslist?: string[];
	rollupInputOptions: InputOptions;
	rollupOutputOptions?: OutputOptions;
}