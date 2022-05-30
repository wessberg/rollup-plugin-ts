import {TypescriptPluginBaseOptions} from "../../plugin/typescript-plugin-options.js";
import {TS} from "../../type/ts.js";

export interface GetBrowserslistOptions {
	cwd: string;
	browserslist?: TypescriptPluginBaseOptions["browserslist"];
	fileSystem: TS.System;
}
