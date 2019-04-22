import {CompilerOptions, parseConfigFileTextToJson, ParsedCommandLine, parseJsonConfigFileContent, sys} from "typescript";
import {IGetParsedCommandLineOptions} from "./i-get-parsed-command-line-options";
import {fileExistsSync, readFileSync} from "../file-system/file-system";
import {ensureAbsolute} from "../path/path-util";
import {DECLARATION_EXTENSION} from "../../constant/constant";
import {GetParsedCommandLineResult} from "./get-parsed-command-line-result";

/**
 * Returns true if the given tsconfig is a ParsedCommandLine
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is ParsedCommandLine}
 */
export function isParsedCommandLine(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is ParsedCommandLine {
	return tsconfig != null && typeof tsconfig !== "string" && "options" in tsconfig;
}

/**
 * Returns true if the given tsconfig are raw, JSON-serializable CompilerOptions
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is CompilerOptions}
 */
export function isRawCompilerOptions(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is Partial<Record<keyof CompilerOptions, string | number | boolean>> {
	return tsconfig != null && typeof tsconfig !== "string" && !("options" in tsconfig);
}

/**
 * Returns true if the given tsconfig are CompilerOptions
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is CompilerOptions}
 */
export function isCompilerOptions(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is Partial<CompilerOptions> {
	return (
		tsconfig != null &&
		typeof tsconfig !== "string" &&
		!("options" in tsconfig) &&
		(("module" in tsconfig && typeof tsconfig.module === "number") ||
			("target" in tsconfig && typeof tsconfig.target === "number") ||
			("jsx" in tsconfig && typeof tsconfig.jsx === "number") ||
			("moduleResolution" in tsconfig && typeof tsconfig.moduleResolution === "number") ||
			("newLine" in tsconfig && typeof tsconfig.newLine === "number"))
	);
}

/**
 * Gets a ParsedCommandLine based on the given options
 * @param {IGetParsedCommandLineOptions} options
 * @returns {GetParsedCommandLineResult}
 */
export function getParsedCommandLine({cwd, tsconfig, forcedCompilerOptions = {}}: IGetParsedCommandLineOptions): GetParsedCommandLineResult {
	const hasProvidedTsconfig = tsconfig != null;
	let originalCompilerOptions: CompilerOptions | undefined;
	let parsedCommandLine: ParsedCommandLine;

	// If the given tsconfig is already a ParsedCommandLine, use that one, but apply the forced CompilerOptions
	if (isParsedCommandLine(tsconfig)) {
		originalCompilerOptions = tsconfig.options;
		tsconfig.options = {...tsconfig.options, ...forcedCompilerOptions};
		parsedCommandLine = tsconfig;
	}

	// If the user provided CompilerOptions directly, use those to build a ParsedCommandLine
	else if (isCompilerOptions(tsconfig)) {
		originalCompilerOptions = parseJsonConfigFileContent({}, sys, cwd, tsconfig).options;
		parsedCommandLine = parseJsonConfigFileContent({}, sys, cwd, {
			...tsconfig,
			...forcedCompilerOptions
		});
	}

	// If the user provided JSON-serializable ("raw") CompilerOptions directly, use those to build a ParsedCommandLine
	else if (isRawCompilerOptions(tsconfig)) {
		originalCompilerOptions = parseJsonConfigFileContent({compilerOptions: tsconfig}, sys, cwd).options;
		parsedCommandLine = parseJsonConfigFileContent({compilerOptions: tsconfig}, sys, cwd, forcedCompilerOptions);
	}

	// Otherwise, attempt to resolve it and parse it
	else {
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

		originalCompilerOptions = parseJsonConfigFileContent(parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config, sys, cwd, {}, tsconfigPath).options;
		parsedCommandLine = parseJsonConfigFileContent(parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config, sys, cwd, forcedCompilerOptions, tsconfigPath);
	}

	// Remove all non-declaration files from the default file names since these will be handled separately by Rollup
	parsedCommandLine.fileNames = parsedCommandLine.fileNames.filter(file => file.endsWith(DECLARATION_EXTENSION));

	return {
		parsedCommandLine,
		originalCompilerOptions
	};
}
