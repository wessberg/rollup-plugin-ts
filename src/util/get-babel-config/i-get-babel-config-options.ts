import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {IGetForcedBabelOptionsResult} from "../get-forced-babel-options/i-get-forced-babel-options-result";
import {IGetDefaultBabelOptionsResult} from "../get-default-babel-options/i-get-default-babel-options-result";
import {InputOptions} from "rollup";

export interface IGetBabelConfigOptions {
	cwd: string;
	browserslist: string[] | undefined;
	rollupInputOptions: InputOptions;
	babelConfig?: ITypescriptPluginBabelOptions["babelConfig"];
	forcedOptions?: IGetForcedBabelOptionsResult;
	defaultOptions?: IGetDefaultBabelOptionsResult;
}
