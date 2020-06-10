import {InputOptions} from "rollup";
import {TransformOptions} from "@babel/core";
import {BabelConfigHook, TypescriptPluginBabelOptions, TranspilationPhase} from "../../plugin/i-typescript-plugin-options";

export interface GetBabelConfigOptions {
	cwd: string;
	hook: BabelConfigHook | undefined;
	babelConfig: TypescriptPluginBabelOptions["babelConfig"];
	browserslist: string[] | undefined;
	rollupInputOptions: InputOptions;
	forcedOptions: TransformOptions | undefined;
	defaultOptions: TransformOptions | undefined;
	phase: TranspilationPhase;
}
