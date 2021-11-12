import {InputOptions} from "rollup";
import {TransformOptions} from "@babel/core";
import {BabelConfigHook, TypescriptPluginBabelOptions, TranspilationPhase} from "../../plugin/typescript-plugin-options";
import {Babel} from "../../type/babel";

export interface GetBabelConfigOptions {
	babel: typeof Babel;
	cwd: string;
	hook: BabelConfigHook | undefined;
	babelConfig: TypescriptPluginBabelOptions["babelConfig"];
	browserslist: string[] | undefined;
	rollupInputOptions: InputOptions;
	forcedOptions: TransformOptions | undefined;
	defaultOptions: TransformOptions | undefined;
	phase: TranspilationPhase;
}
