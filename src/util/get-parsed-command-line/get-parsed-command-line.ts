import {CompilerOptions, parseConfigFileTextToJson, ParsedCommandLine, parseJsonConfigFileContent, sys} from "typescript";
import {IGetParsedCommandLineOptions} from "./i-get-parsed-command-line-options";
import {fileExistsSync, readFileSync} from "../file-system/file-system";
import {ensureAbsolute} from "../path/path-util";

/**
 * Returns true if the given tsconfig is a ParsedCommandLine
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is ParsedCommandLine}
 */
export function isParsedCommandLine (tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is ParsedCommandLine {
	return tsconfig != null && typeof tsconfig !== "string" && "options" in tsconfig;
}

/**
 * Returns true if the given tsconfig are CompilerOptions
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is CompilerOptions}
 */
export function isCompilerOptions (tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is Partial<CompilerOptions> {
	return tsconfig != null && typeof tsconfig !== "string" && !("options" in tsconfig);
}

/**
 * Gets a ParsedCommandLine based on the given options
 * @param {IGetParsedCommandLineOptions} options
 * @returns {ParsedCommandLine}
 */
export function getParsedCommandLine ({cwd, tsconfig, forcedCompilerOptions = {}}: IGetParsedCommandLineOptions): ParsedCommandLine {
	const hasProvidedTsconfig = tsconfig != null;

	// If the given tsconfig is already a ParsedCommandLine, use that one, but apply the forced CompilerOptions
	if (isParsedCommandLine(tsconfig)) {
		tsconfig.options = {...tsconfig.options, ...forcedCompilerOptions};
		// Always start from zero files and then build from there
		tsconfig.fileNames = [];
		return tsconfig;

		// If the user provided CompilerOptions directly, use those to build a ParsedCommandLine
	} else if (isCompilerOptions(tsconfig)) {
		const parsed = parseJsonConfigFileContent({compilerOptions: tsconfig}, sys, cwd, forcedCompilerOptions);
		// Always start from zero files and then build from there
		parsed.fileNames = [];
		return parsed;
	}

	// Otherwise, attempt to resolve it and parse it
	let tsconfigContent: string;
	const tsconfigPath = ensureAbsolute(cwd, tsconfig != null ? tsconfig : "tsconfig.json");

	// If the file exists, read the tsconfig on that location
	if (fileExistsSync(tsconfigPath)) {
		tsconfigContent = readFileSync(tsconfigPath).toString();
	}

	// Otherwise, if the user hasn't provided any tsconfig at all, start from an empty one (and only use the forced options)
	else if (!hasProvidedTsconfig) {
		tsconfigContent = "";
	}

	// Finally, if the user has provided a file that doesn't exist, throw
	else {
		throw new ReferenceError(`The given tsconfig: '${tsconfigPath}' doesn't exist!`);
	}

	const parsedResult = parseJsonConfigFileContent(
		parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config,
		sys,
		cwd,
		forcedCompilerOptions,
		tsconfigPath
	);

	// Always start from zero files and then build from there
	parsedResult.fileNames = [];
	return parsedResult;
}