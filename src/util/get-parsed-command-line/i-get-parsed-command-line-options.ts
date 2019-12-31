import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {FileSystem} from "../file-system/file-system";
import {TS} from "../../type/ts";

export interface IGetParsedCommandLineOptions {
	cwd: string;
	tsconfig?: TypescriptPluginOptions["tsconfig"];
	forcedCompilerOptions?: TS.CompilerOptions;
	fileSystem: FileSystem;
	typescript: typeof TS;
}
