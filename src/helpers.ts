import chalk from "chalk";
import {basename, dirname, isAbsolute, join, parse, relative} from "path";
import {InputOptions, ModuleFormat, OutputOptions} from "rollup";
import {CompilerOptions, Diagnostic, DiagnosticCategory, findConfigFile, formatDiagnostic, ModuleKind, parseConfigFileTextToJson, ParsedCommandLine, parseJsonConfigFileContent, sys} from "typescript";
import {DECLARATION_EXTENSION, DEFAULT_DESTINATION, JAVASCRIPT_EXTENSION, JSX_EXTENSION, MJS_EXTENSION, TSX_EXTENSION, TYPESCRIPT_EXTENSION} from "./constants";
import {FormatHost} from "./format-host";
import {IBabelOptions} from "./i-babel-options";
import {IGetBabelOptionsOptions} from "./i-get-babel-options-options";

// tslint:disable:no-any

/**
 * Finds the tsconfig file from the given root
 * @param {string} appRoot
 * @param {string} tsconfig
 * @param {Partial<CompilerOptions>} forcedOptions
 * @returns {ParsedCommandLine}
 */
export async function resolveTypescriptOptions (appRoot: string, tsconfig: string, forcedOptions: Partial<CompilerOptions> = {}): Promise<ParsedCommandLine> {
	const path = findConfigFile(appRoot, fileName => sys.fileExists(fileName), tsconfig);

	// If the path could not be resolved, throw an exception
	if (path == null) {
		throw new ReferenceError(`Typescript plugin could not find a tsconfig.json file from location: ${appRoot}`);
	}

	// Read the content of that file
	const content = sys.readFile(path)!;

	// Parse it into CompilerOptions
	return parseJsonConfigFileContent(
		parseConfigFileTextToJson(path, content.toString()).config,
		sys, appRoot, forcedOptions, path);
}

/**
 * Gets a proper ModuleKind for Typescript based on the format given from the Rollup options
 * @param {ModuleFormat} format
 * @returns {ModuleKind}
 */
function getModuleKindFromRollupFormat (format: ModuleFormat): ModuleKind {
	switch (format) {
		case "amd":
			return ModuleKind.AMD;
		case "cjs":
			return ModuleKind.CommonJS;
		case "system":
			return ModuleKind.System;
		case "es":
		case "esm":
			return ModuleKind.ESNext;
		case "umd":
			return ModuleKind.UMD;
		case "iife":
			return ModuleKind.None;
	}
}

/**
 * Gets a the destination directory to use based on the given Rollup output options
 * @param {string} appRoot
 * @param {Partial<OutputOptions>} options
 * @returns {ModuleKind}
 */
export function getDestinationDirectoryFromRollupOutputOptions (appRoot: string, options: Partial<OutputOptions>): string {
	// Normalize the destination directory
	const normalizedDest = options.dir != null ? options.dir : options.file != null ? dirname(options.file) : options.dest != null ? dirname(options.dest) : undefined;
	if (normalizedDest == null) {
		return ".";
	}

	// Return the directory name of the destination file of the rollup build
	return ensureRelative(appRoot, normalizedDest);
}

/**
 * Gets a the destination file path to use based on the given Rollup output options
 * @param {string} appRoot
 * @param {Partial<OutputOptions>} options
 * @returns {ModuleKind}
 */
export function getDestinationFilePathFromRollupOutputOptions (appRoot: string, options: Partial<OutputOptions>): string {
	// Normalize the destination directory
	const normalizedDest = getDestinationDirectoryFromRollupOutputOptions(appRoot, options);
	const normalizedFile = options.dest != null ? options.dest : options.file != null ? options.file : DEFAULT_DESTINATION;

	// Return the file path for the destination file of the rollup build
	return ensureRelative(appRoot, join(normalizedDest, basename(normalizedFile)));
}

/**
 * Ensures that the given path is absolute
 * @param {string} root
 * @param {string} path
 * @returns {string}
 */
export function ensureRelative (root: string, path: string): string {
	// If the path is already absolute, simply return it
	if (!isAbsolute(path)) {
		return path;
	}

	// Otherwise, construct an absolute path from the root
	return relative(root, path);
}

/**
 * Replaces the extension of the given path with the extension of a declaration file
 * @param {string} path
 * @returns {string}
 */
export function toTypescriptDeclarationFileExtension (path: string): string {
	const replaced = path
		.replace(DECLARATION_EXTENSION, "")
		.replace(TYPESCRIPT_EXTENSION, "")
		.replace(JAVASCRIPT_EXTENSION, "");
	return `${join(dirname(replaced), basename(replaced))}${DECLARATION_EXTENSION}`;
}

/**
 * Retrieves the CompilerOptions that will be forced
 * @param {string} root
 * @param {Partial<InputOptions>} [_rollupInputOptions]
 * @param {Partial<OutputOptions>} [rollupOutputOptions]
 * @returns {Partial<CompilerOptions>}
 */
export function getForcedCompilerOptions (root: string, _rollupInputOptions: Partial<InputOptions> = {}, rollupOutputOptions: Partial<OutputOptions> = {}): Partial<CompilerOptions> {
	return {
		...(rollupOutputOptions.format == null ? {} : {module: getModuleKindFromRollupFormat(rollupOutputOptions.format)}),
		outDir: getDestinationDirectoryFromRollupOutputOptions(root, rollupOutputOptions),
		baseUrl: "."
	};
}

/**
 * Prints the given Diagnostic
 * @param {ReadonlyArray<Diagnostic>} diagnostics
 * @param {FormatHost} formatHost
 */
export function printDiagnostics (diagnostics: ReadonlyArray<Diagnostic>, formatHost: FormatHost): void {

	// Take all errors
	const [firstError, ...otherErrors] = diagnostics.filter(diagnostic => diagnostic.category === DiagnosticCategory.Error);

	// Take everything else
	const rest = [...otherErrors, ...diagnostics.filter(diagnostic => diagnostic.category !== DiagnosticCategory.Error)];

	// Walk through all diagnostics that isn't errors
	for (const diagnostic of rest) {
		const formatted = formatDiagnostic(diagnostic, formatHost);

		switch (diagnostic.category) {
			case DiagnosticCategory.Message:
				console.info(chalk.white(formatted));
				break;
			case DiagnosticCategory.Warning:
				console.warn(chalk.yellow(formatted));
				break;
			case DiagnosticCategory.Error:
				console.warn(chalk.red(formatted));
				break;
		}
	}

	// Format and throw the first error, if there is any
	if (firstError != null) {
		throw new Error(chalk.red(formatDiagnostic(firstError, formatHost)));
	}
}

/**
 * Returns true if the given file name represents the main entry point
 * @param {string} root
 * @param {string} fileName
 * @param {InputOptions} inputOptions
 * @returns {boolean}
 */
export function isMainEntry (root: string, fileName: string, inputOptions?: InputOptions): boolean {
	// Ensure that the input options are defined, otherwise return false
	if (inputOptions == null) return false;

	// Normalize the main entry
	const normalizedInput = Array.isArray(inputOptions.input) ? inputOptions.input : typeof inputOptions.input === "string" ? [inputOptions.input] : Object.values(inputOptions.input);
	return normalizedInput.some(path => ensureRelative(root, fileName) === ensureRelative(root, path));
}

/**
 * Gets the options to use with Babel
 * @param {string} filename
 * @param {string} relativeFilename
 * @param {ParsedCommandLine} typescriptOptions
 * @param {Browserslist} browserslist
 * @param {{}[]} [additionalPlugins=[]]
 * @param {{}[]} [additionalPresets=[]]
 * @returns {Partial<IBabelOptions>}
 */
export function getBabelOptions ({filename, relativeFilename, typescriptOptions, browserslist, additionalPlugins = [], additionalPresets = []}: IGetBabelOptionsOptions): Partial<IBabelOptions> {
	return {
		configFile: false,
		babelrc: false,
		babelrcRoots: false,
		code: true,
		comments: false,
		filename,
		filenameRelative: relativeFilename,
		sourceMaps: typescriptOptions.options.sourceMap,
		root: typescriptOptions.options.baseUrl!,
		presets: [
			...additionalPresets,
			["@babel/preset-env", {
				// Loose breaks things such as spreading an iterable that isn't an array
				loose: false,
				spec: false,
				modules: false,
				debug: false,
				ignoreBrowserslistConfig: false,
				shippedProposals: true,
				targets: {
					browsers: browserslist
				}
			}]
		],
		plugins: [
			...additionalPlugins,
			["@babel/plugin-proposal-decorators", {legacy: true}],
			["@babel/plugin-proposal-class-properties", {loose: false}],
			"@babel/plugin-proposal-object-rest-spread",
			"@babel/plugin-proposal-async-generator-functions",
			"@babel/plugin-syntax-dynamic-import",
			"@babel/plugin-proposal-optional-catch-binding"
		]
	};
}

/**
 * Returns true if the given file is a Javascript file
 * @param {string} file
 * @returns {boolean}
 */
export function isJSFile (file: string): boolean {
	return file.endsWith(JAVASCRIPT_EXTENSION) || file.endsWith(JSX_EXTENSION) || file.endsWith(MJS_EXTENSION);
}

/**
 * Returns true if the given file is a Typescript file
 * @param {string} file
 * @returns {boolean}
 */
export function isTSFile (file: string): boolean {
	return file.endsWith(TYPESCRIPT_EXTENSION) || file.endsWith(TSX_EXTENSION);
}

/**
 * Returns true if the given file is a Typescript declaration (.d.ts) file
 * @param {string} file
 * @returns {boolean}
 */
export function isDTSFile (file: string): boolean {
	return file.endsWith(DECLARATION_EXTENSION);
}

/**
 * Ensures that the given file ends with '.ts', no matter what it actually ends with
 * This is to support Typescript's language service with files that doesn't necessarily end with it.
 * @param {string} file
 * @returns {string}
 */
export function ensureTs (file: string): string {
	const {dir, name, ext} = parse(file);
	const base = join(dir, name);
	if (ext !== TYPESCRIPT_EXTENSION) return `${base}${TYPESCRIPT_EXTENSION}`;
	return file;
}

/**
 * Ensures that the given file ends with '.ts', no matter what it actually ends with
 * This is to support Typescript's language service with files that doesn't necessarily end with it.
 * @param {string} file
 * @returns {string}
 */
export function stripExtension (file: string): string {
	const {dir, name} = parse(file);
	return join(dir, name);
}

/**
 * Returns true if the given file should be included for compilation
 * @param {string} file
 * @param {(fileName: string) => boolean} filter
 * @returns {boolean}
 */
export function includeFile (file: string, filter: (fileName: string) => boolean): boolean {
	return filter(file) && !isDTSFile(file);
}

/**
 * Returns true if the given file should be included for Typescript emits
 * @param {string} file
 * @param {(fileName: string) => boolean} filter
 * @returns {boolean}
 */
export function includeFileForTSEmit (file: string, filter: (fileName: string) => boolean): boolean {
	return includeFile(file, filter);
}