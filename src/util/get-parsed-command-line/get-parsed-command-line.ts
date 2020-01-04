import {IGetParsedCommandLineOptions} from "./i-get-parsed-command-line-options";
import {ensureAbsolute} from "../path/path-util";
import {D_TS_EXTENSION} from "../../constant/constant";
import {GetParsedCommandLineResult} from "./get-parsed-command-line-result";
import {InputCompilerOptions, TsConfigResolver, TsConfigResolverWithFileName} from "../../plugin/i-typescript-plugin-options";
import {TS} from "../../type/ts";

/**
 * Returns true if the given tsconfig is a ParsedCommandLine
 */
export function isParsedCommandLine(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is TS.ParsedCommandLine {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && "options" in tsconfig && !("hook" in tsconfig);
}

/**
 * Returns true if the given tsconfig are raw, JSON-serializable CompilerOptions
 */
export function isRawCompilerOptions(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is Partial<InputCompilerOptions> {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && !("options" in tsconfig) && !("hook" in tsconfig);
}

/**
 * Returns true if the given tsconfig is in fact a function that receives resolved CompilerOptions that can be extended
 */
export function isTsConfigResolver(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is TsConfigResolver {
	return tsconfig != null && typeof tsconfig === "function";
}

/**
 * Returns true if the given tsconfig is in fact an object that provides a filename for a tsconfig,
 * as well as a 'hook' function that receives resolved CompilerOptions that can be extended
 */
export function isTsConfigResolverWithFileName(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is TsConfigResolverWithFileName {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && !("options" in tsconfig) && "hook" in tsconfig;
}

/**
 * Returns true if the given tsconfig are CompilerOptions
 */
export function isCompilerOptions(tsconfig?: IGetParsedCommandLineOptions["tsconfig"]): tsconfig is Partial<TS.CompilerOptions> {
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
 */
export function getParsedCommandLine({
	cwd,
	tsconfig,
	fileSystem,
	forcedCompilerOptions = {},
	typescript
}: IGetParsedCommandLineOptions): GetParsedCommandLineResult {
	const hasProvidedTsconfig = tsconfig != null;
	let originalCompilerOptions: TS.CompilerOptions | undefined;
	let parsedCommandLine: TS.ParsedCommandLine;

	// If the given tsconfig is already a ParsedCommandLine, use that one, but apply the forced CompilerOptions
	if (isParsedCommandLine(tsconfig)) {
		originalCompilerOptions = tsconfig.options;
		tsconfig.options = {...tsconfig.options, ...forcedCompilerOptions};
		parsedCommandLine = tsconfig;
	}

	// If the user provided CompilerOptions directly, use those to build a ParsedCommandLine
	else if (isCompilerOptions(tsconfig)) {
		originalCompilerOptions = typescript.parseJsonConfigFileContent({}, fileSystem, cwd, tsconfig).options;
		parsedCommandLine = typescript.parseJsonConfigFileContent({}, fileSystem, cwd, {
			...tsconfig,
			...forcedCompilerOptions
		});
	}

	// If the user provided JSON-serializable ("raw") CompilerOptions directly, use those to build a ParsedCommandLine
	else if (isRawCompilerOptions(tsconfig)) {
		originalCompilerOptions = typescript.parseJsonConfigFileContent({compilerOptions: tsconfig}, fileSystem, cwd).options;
		parsedCommandLine = typescript.parseJsonConfigFileContent({compilerOptions: tsconfig}, fileSystem, cwd, forcedCompilerOptions);
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

		originalCompilerOptions = typescript.parseJsonConfigFileContent(
			typescript.parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config,
			fileSystem,
			cwd,
			{},
			tsconfigPath
		).options;
		parsedCommandLine = typescript.parseJsonConfigFileContent(
			typescript.parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config,
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
	parsedCommandLine.fileNames = parsedCommandLine.fileNames.filter(file => file.endsWith(D_TS_EXTENSION));

	return {
		parsedCommandLine,
		originalCompilerOptions
	};
}
