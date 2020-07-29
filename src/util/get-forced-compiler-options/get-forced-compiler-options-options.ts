import {InputOptions, OutputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/typescript-plugin-options";

export interface GetForcedCompilerOptionsOptions {
	pluginOptions: TypescriptPluginOptions;
	browserslist: string[] | undefined | false;
	rollupInputOptions: InputOptions;
	rollupOutputOptions?: OutputOptions;
}
