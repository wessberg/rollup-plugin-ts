import {InputOptions, OutputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";

export interface GetForcedCompilerOptionsOptions {
	pluginOptions: TypescriptPluginOptions;
	browserslist?: string[];
	rollupInputOptions: InputOptions;
	rollupOutputOptions?: OutputOptions;
}
