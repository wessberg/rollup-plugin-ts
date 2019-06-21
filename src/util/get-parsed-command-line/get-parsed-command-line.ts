import {CompilerOptions, parseConfigFileTextToJson, ParsedCommandLine, parseJsonConfigFileContent} from "typescript";
import {IGetParsedCommandLineOptions} from "./i-get-parsed-command-line-options";
import {ensureAbsolute} from "../path/path-util";
import {DECLARATION_EXTENSION} from "../../constant/constant";
import {GetParsedCommandLineResult} from "./get-parsed-command-line-result";
import {TsConfigResolver, TsConfigResolverWithFileName} from "../../plugin/i-typescript-plugin-options";

/**
 * Returns true if the given tsconfig is a ParsedCommandLine
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is ParsedCommandLine}
 */
export function isParsedCommandLine(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is ParsedCommandLine {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && "options" in tsconfig && !("hook" in tsconfig);
}

/**
 * Returns true if the given tsconfig are raw, JSON-serializable CompilerOptions
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is Partial<Record<keyof CompilerOptions, string | number | boolean>>}
 */
export function isRawCompilerOptions(
	tsconfig?: IGetParsedCommandLineOptions["tsconfig"]
): tsconfig is Partial<Record<keyof CompilerOptions, string | number | boolean>> {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && !("options" in tsconfig) && !("hook" in tsconfig);
}

/**
 * Returns true if the given tsconfig is in fact a function that receives resolved CompilerOptions that can be extended
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is TsConfigResolver}
 */
export function isTsConfigResolver(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is TsConfigResolver {
	return tsconfig != null && typeof tsconfig === "function";
}

/**
 * Returns true if the given tsconfig is in fact an object that provides a filename for a tsconfig,
 * as well as a 'hook' function that receives resolved CompilerOptions that can be extended
 * @param {IGetParsedCommandLineOptions["tsconfig"]} tsconfig
 * @returns {tsconfig is TsConfigResolverWithFileName}
 */
export function isTsConfigResolverWithFileName(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is TsConfigResolverWithFileName {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && !("options" in tsconfig) && "hook" in tsconfig;
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
		typeof tsconfig !== "function" &&
		!("options" in tsconfig) &&
		!("hook" in tsconfig) &&
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
export function getParsedCommandLine({
	cwd,
	tsconfig,
	fileSystem,
	forcedCompilerOptions = {}
}: IGetParsedCommandLineOptions): GetParsedCommandLineResult {
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
		originalCompilerOptions = parseJsonConfigFileContent({}, fileSystem, cwd, tsconfig).options;
		parsedCommandLine = parseJsonConfigFileContent({}, fileSystem, cwd, {
			...tsconfig,
			...forcedCompilerOptions
		});
	}

	// If the user provided JSON-serializable ("raw") CompilerOptions directly, use those to build a ParsedCommandLine
	else if (isRawCompilerOptions(tsconfig)) {
		originalCompilerOptions = parseJsonConfigFileContent({compilerOptions: tsconfig}, fileSystem, cwd).options;
		parsedCommandLine = parseJsonConfigFileContent({compilerOptions: tsconfig}, fileSystem, cwd, forcedCompilerOptions);
	}

	// Otherwise, attempt to resolve it and parse it
	else {
		const tsconfigPath = ensureAbsolute(
			cwd,
			isTsConfigResolverWithFileName(tsconfig) ? tsconfig.fileName : tsconfig != null && !isTsConfigResolver(tsconfig) ? tsconfig : "tsconfig.json"
		);

		// If the file exists, read the tsconfig on that location
		let tsconfigContent = fileSystem.readFile(tsconfigPath);

		// Otherwise, if the user hasn't provided any tsconfig at all, start from an empty one (and only use the forced options)
		if (tsconfigContent == null && !hasProvidedTsconfig) {
			tsconfigContent = "";
		}

		// Finally, if the user has provided a file that doesn't exist, throw
		else if (tsconfigContent == null) {
			throw new ReferenceError(`The given tsconfig: '${tsconfigPath}' doesn't exist!`);
		}

		originalCompilerOptions = parseJsonConfigFileContent(
			parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config,
			fileSystem,
			cwd,
			{},
			tsconfigPath
		).options;
		parsedCommandLine = parseJsonConfigFileContent(
			parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config,
			fileSystem,
			cwd,
			forcedCompilerOptions,
			tsconfigPath
		);

		// If an extension hook has been provided. Make sure to still apply the forced CompilerOptions
		if (isTsConfigResolver(tsconfig)) {
			originalCompilerOptions = {...tsconfig(originalCompilerOptions), ...forcedCompilerOptions};
			parsedCommandLine.options = {...tsconfig(parsedCommandLine.options), ...forcedCompilerOptions};
		} else if (isTsConfigResolverWithFileName(tsconfig)) {
			// If an extension hook has been provided through the 'hook' property. Make sure to still apply the forced CompilerOptions
			originalCompilerOptions = {...tsconfig.hook(originalCompilerOptions), ...forcedCompilerOptions};
			parsedCommandLine.options = {...tsconfig.hook(parsedCommandLine.options), ...forcedCompilerOptions};
		}
	}

	// Remove all non-declaration files from the default file names since these will be handled separately by Rollup
	parsedCommandLine.fileNames = parsedCommandLine.fileNames.filter(file => file.endsWith(DECLARATION_EXTENSION));

	return {
		parsedCommandLine,
		originalCompilerOptions
	};
}
