import {InputOptions, ModuleFormat, OutputOptions} from "rollup";
import chalk from "chalk";
import {basename, dirname, isAbsolute, join, relative} from "path";
import {CompilerOptions, Diagnostic, DiagnosticCategory, findConfigFile, formatDiagnostic, ModuleKind, parseConfigFileTextToJson, ParsedCommandLine, parseJsonConfigFileContent, sys} from "typescript";
import {DECLARATION_EXTENSION, TYPESCRIPT_EXTENSION} from "./constants";
import {FormatHost} from "./format-host";

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
		case "es6":
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
		.replace(TYPESCRIPT_EXTENSION, "");
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
 * @param {Diagnostic[]} diagnostic
 * @param {FormatHost} formatHost
 */
export function printDiagnostic (diagnostic: Diagnostic, formatHost: FormatHost): void {
	const formatted = formatDiagnostic(diagnostic, formatHost);

	switch (diagnostic.category) {
		case DiagnosticCategory.Message:
			return console.info(chalk.white(formatted));
		case DiagnosticCategory.Warning:
			return console.warn(chalk.yellow(formatted));
		case DiagnosticCategory.Error:
			throw new Error(chalk.red(formatted));
	}
}