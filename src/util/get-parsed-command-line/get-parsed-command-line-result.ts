import {CompilerOptions, ParsedCommandLine} from "typescript";

export interface GetParsedCommandLineResult {
	parsedCommandLine: ParsedCommandLine;
	originalCompilerOptions: CompilerOptions;
}
