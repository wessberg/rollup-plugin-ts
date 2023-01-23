import type {InputOptions} from "rollup";
import type {TypescriptPluginOptions} from "../../plugin/typescript-plugin-options.js";

export interface GetForcedCompilerOptionsOptions {
	pluginOptions: TypescriptPluginOptions;
	browserslist: string[] | undefined | false;
	rollupInputOptions: InputOptions;
}
