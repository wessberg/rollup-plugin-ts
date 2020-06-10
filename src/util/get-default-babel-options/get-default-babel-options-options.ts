import {TypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {InputOptions, OutputOptions} from "rollup";

export interface GetDefaultBabelOptionsOptions {
	pluginOptions: TypescriptPluginBabelOptions;
	browserslist?: string[];
	rollupInputOptions: InputOptions;
	rollupOutputOptions?: OutputOptions;
}
