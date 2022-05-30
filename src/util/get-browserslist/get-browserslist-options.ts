import {TypescriptPluginOptions} from "../../plugin/typescript-plugin-options.js";
import {TS} from "../../type/ts.js";

export interface GetBrowserslistOptions {
	cwd: string;
	browserslist?: TypescriptPluginOptions["browserslist"];
	fileSystem: TS.System;
}
