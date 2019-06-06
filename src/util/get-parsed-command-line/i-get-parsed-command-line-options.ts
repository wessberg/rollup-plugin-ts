import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {CompilerOptions} from "typescript";
import {FileSystem} from "../file-system/file-system";

export interface IGetParsedCommandLineOptions {
	cwd: string;
	tsconfig?: TypescriptPluginOptions["tsconfig"];
	forcedCompilerOptions?: CompilerOptions;
	fileSystem: FileSystem;
}
