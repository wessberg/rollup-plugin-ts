import {TS} from "../../type/ts";

export interface GetParsedCommandLineResult {
	parsedCommandLine: TS.ParsedCommandLine;
	originalCompilerOptions: TS.CompilerOptions;
}
