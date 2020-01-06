import {TS} from "../../type/ts";

export interface ParsedCommandLineResult {
	parsedCommandLine: TS.ParsedCommandLine;
	originalCompilerOptions: TS.CompilerOptions;
	tsconfigPath: string;
}
