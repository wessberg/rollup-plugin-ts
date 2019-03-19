import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {InputOptions, OutputOptions} from "rollup";
import {CompilerOptions} from "typescript";

export interface IGetDefaultBabelOptionsOptions {
	pluginOptions: ITypescriptPluginBabelOptions;
	browserslist?: string[];
	rollupInputOptions: InputOptions;
	rollupOutputOptions?: OutputOptions;
	originalCompilerOptions: CompilerOptions;
}
