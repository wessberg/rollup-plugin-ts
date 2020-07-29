import {TypescriptPluginBaseOptions} from "../../plugin/typescript-plugin-options";
import {FileSystem} from "../file-system/file-system";

export interface GetBrowserslistOptions {
	cwd: string;
	browserslist?: TypescriptPluginBaseOptions["browserslist"];
	fileSystem: FileSystem;
}
