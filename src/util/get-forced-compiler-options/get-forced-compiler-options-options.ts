import {InputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/typescript-plugin-options.js";

export interface GetForcedCompilerOptionsOptions {
	pluginOptions: TypescriptPluginOptions;
	browserslist: string[] | undefined | false;
	rollupInputOptions: InputOptions;
}
