import type {TS} from "../../type/ts.js";

export interface ParsedCommandLineResult {
	parsedCommandLine: TS.ParsedCommandLine;
	originalCompilerOptions: TS.CompilerOptions;
	tsconfigPath: string;
}
