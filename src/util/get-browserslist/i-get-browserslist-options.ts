import {ITypescriptPluginBaseOptions} from "../../plugin/i-typescript-plugin-options";

export interface IGetBrowserslistOptions {
	cwd: string;
	browserslist?: ITypescriptPluginBaseOptions["browserslist"];
}
