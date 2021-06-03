import {TypescriptPluginBaseOptions} from "../../plugin/typescript-plugin-options";
import {TS} from "../../type/ts";

export interface GetBrowserslistOptions {
	cwd: string;
	browserslist?: TypescriptPluginBaseOptions["browserslist"];
	fileSystem: TS.System;
}
