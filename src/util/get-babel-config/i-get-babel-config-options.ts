import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {IGetForcedBabelOptionsResult} from "../get-forced-babel-options/i-get-forced-babel-options-result";
import {IGetDefaultBabelOptionsResult} from "../get-default-babel-options/i-get-default-babel-options-result";

export interface IGetBabelConfigOptions {
	cwd: string;
	babelConfig?: ITypescriptPluginBabelOptions["babelConfig"];
	forcedOptions?: IGetForcedBabelOptionsResult;
	defaultOptions?: IGetDefaultBabelOptionsResult;
}
