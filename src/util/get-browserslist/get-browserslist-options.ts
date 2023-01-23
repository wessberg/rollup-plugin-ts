import type {TypescriptPluginOptions} from "../../plugin/typescript-plugin-options.js";
import type {TS} from "../../type/ts.js";

export interface GetBrowserslistOptions {
	cwd: string;
	browserslist?: TypescriptPluginOptions["browserslist"];
	fileSystem: TS.System;
}
