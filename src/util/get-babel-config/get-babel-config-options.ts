import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {IGetForcedBabelOptionsResult} from "../get-forced-babel-options/i-get-forced-babel-options-result";
import {IGetDefaultBabelOptionsResult} from "../get-default-babel-options/i-get-default-babel-options-result";
import {InputOptions} from "rollup";
import {FindBabelConfigOptions} from "./find-babel-config-options";

export interface GetBabelConfigOptions extends FindBabelConfigOptions {
	browserslist: string[] | undefined;
	rollupInputOptions: InputOptions;
	forcedOptions?: IGetForcedBabelOptionsResult;
	defaultOptions?: IGetDefaultBabelOptionsResult;
	noBabelConfigCustomization?: ITypescriptPluginBabelOptions["noBabelConfigCustomization"];
}
