import {ensureAbsolute, nativeDirname} from "../path/path-util";
import {D_TS_EXTENSION, DEFAULT_TSCONFIG_FILE_NAME} from "../../constant/constant";
import {ParsedCommandLineResult} from "./parsed-command-line-result";
import {
	InputCompilerOptions,
	TsConfigResolver,
	TsConfigResolverWithFileName,
	TypescriptPluginOptions
} from "../../plugin/i-typescript-plugin-options";
import {TS} from "../../type/ts";
import {finalizeParsedCommandLine} from "../finalize-parsed-command-line/finalize-parsed-command-line";
import {FileSystem} from "../file-system/file-system";

export interface GetParsedCommandLineOptions {
	cwd: string;
	tsconfig?: TypescriptPluginOptions["tsconfig"];
	forcedCompilerOptions?: TS.CompilerOptions;
	fileSystem: FileSystem;
	typescript: typeof TS;
}

/**
 * Returns true if the given tsconfig is a ParsedCommandLine
 */
export function isParsedCommandLine(tsconfig?: GetParsedCommandLineOptions["tsconfig"]): tsconfig is TS.ParsedCommandLine {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && "options" in tsconfig && !("hook" in tsconfig);
}

/**
 * Returns true if the given tsconfig are raw, JSON-serializable CompilerOptions
 */
export function isRawCompilerOptions(tsconfig?: GetParsedCommandLineOptions["tsconfig"]): tsconfig is Partial<InputCompilerOptions> {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && !("options" in tsconfig) && !("hook" in tsconfig);
}

/**
 * Returns true if the given tsconfig is in fact a function that receives resolved CompilerOptions that can be extended
 */
export function isTsConfigResolver(tsconfig?: GetParsedCommandLineOptions["tsconfig"]): tsconfig is TsConfigResolver {
	return tsconfig != null && typeof tsconfig === "function";
}

/**
 * Returns true if the given tsconfig is in fact an object that provides a filename for a tsconfig,
 * as well as a 'hook' function that receives resolved CompilerOptions that can be extended
 */
export function isTsConfigResolverWithFileName(tsconfig?: GetParsedCommandLineOptions["tsconfig"]): tsconfig is TsConfigResolverWithFileName {
	return tsconfig != null && typeof tsconfig !== "string" && typeof tsconfig !== "function" && !("options" in tsconfig) && "hook" in tsconfig;
}

/**
 * Returns true if the given tsconfig are CompilerOptions
 */
export function isCompilerOptions(tsconfig?: GetParsedCommandLineOptions["tsconfig"]): tsconfig is Partial<TS.CompilerOptions> {
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
export function getParsedCommandLine(options: GetParsedCommandLineOptions): ParsedCommandLineResult {
	const {cwd, tsconfig, fileSystem, forcedCompilerOptions = {}, typescript} = options;
	const hasProvidedTsconfig = tsconfig != null;
	let originalCompilerOptions: TS.CompilerOptions | undefined;
	let parsedCommandLine: TS.ParsedCommandLine;
	let tsconfigPath: string = ensureAbsolute(cwd, DEFAULT_TSCONFIG_FILE_NAME);

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
		tsconfigPath = ensureAbsolute(
			cwd,
			isTsConfigResolverWithFileName(tsconfig)
				? tsconfig.fileName
				: tsconfig != null && !isTsConfigResolver(tsconfig)
				? tsconfig
				: DEFAULT_TSCONFIG_FILE_NAME
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

		const tsconfigJson = typescript.parseConfigFileTextToJson(tsconfigPath, tsconfigContent).config;
		const basePath = nativeDirname(tsconfigPath);

		originalCompilerOptions = typescript.parseJsonConfigFileContent(tsconfigJson, fileSystem, basePath, {}, tsconfigPath).options;
		parsedCommandLine = typescript.parseJsonConfigFileContent(tsconfigJson, fileSystem, basePath, forcedCompilerOptions, tsconfigPath);

		// If an extension hook has been provided. Make sure to still apply the forced CompilerOptions
		if (isTsConfigResolver(tsconfig)) {
			originalCompilerOptions = {...tsconfig(originalCompilerOptions)};
			parsedCommandLine.options = {...tsconfig(parsedCommandLine.options), ...forcedCompilerOptions};
		} else if (isTsConfigResolverWithFileName(tsconfig)) {
			// If an extension hook has been provided through the 'hook' property. Make sure to still apply the forced CompilerOptions
			originalCompilerOptions = {...tsconfig.hook(originalCompilerOptions)};
			parsedCommandLine.options = {...tsconfig.hook(parsedCommandLine.options), ...forcedCompilerOptions};
		}
	}

	// Remove all non-declaration files from the default file names since these will be handled separately by Rollup
	parsedCommandLine.fileNames = parsedCommandLine.fileNames.filter(file => file.endsWith(D_TS_EXTENSION));

	const parsedCommandLineResult: ParsedCommandLineResult = {
		parsedCommandLine,
		originalCompilerOptions,
		tsconfigPath
	};

	// On some TypeScript versions such as 3.0.0, the 'composite' feature
	// require that a specific configFilePath exists on the CompilerOptions,
	// so make sure a path is always set.
	if (parsedCommandLine.options.configFilePath == null) {
		parsedCommandLine.options.configFilePath = tsconfigPath;
	}

	// Finalize the parsed command line
	finalizeParsedCommandLine({...options, parsedCommandLineResult});

	return parsedCommandLineResult;
}
