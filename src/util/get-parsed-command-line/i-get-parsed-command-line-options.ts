import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {CompilerOptions} from "typescript";

export interface IGetParsedCommandLineOptions {
	cwd: string;
	tsconfig?: TypescriptPluginOptions["tsconfig"];
	forcedCompilerOptions?: CompilerOptions;
}
