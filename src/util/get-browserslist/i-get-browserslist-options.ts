import {ITypescriptPluginBaseOptions} from "../../plugin/i-typescript-plugin-options";
import {FileSystem} from "../file-system/file-system";

export interface IGetBrowserslistOptions {
	cwd: string;
	browserslist?: ITypescriptPluginBaseOptions["browserslist"];
	fileSystem: FileSystem;
}
