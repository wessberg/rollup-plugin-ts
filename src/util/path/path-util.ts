import {extname, isAbsolute, join, normalize, relative} from "path";
import {
	BABEL_RUNTIME_PREFIX_1,
	BABEL_RUNTIME_PREFIX_2,
	DECLARATION_EXTENSION,
	DECLARATION_MAP_EXTENSION,
	DEFAULT_LIB_NAMES,
	KNOWN_EXTENSIONS,
	ROLLUP_PLUGIN_MULTI_ENTRY,
	TSLIB_NAME
} from "../../constant/constant";
import slash from "slash";

/**
 * Ensures that the given path follows posix file names
 * @param {string} path
 * @returns {string}
 */
export function ensurePosix(path: string): string {
	return slash(path);
}

/**
 * Gets the extension of the given file
 * @param {string} file
 * @returns {string}
 */
export function getExtension(file: string): string {
	if (file.endsWith(DECLARATION_EXTENSION)) return DECLARATION_EXTENSION;
	else if (file.endsWith(DECLARATION_MAP_EXTENSION)) return DECLARATION_MAP_EXTENSION;
	return extname(file);
}

/**
 * Returns true if the given path represents an external library
 * @param {string} path
 * @returns {boolean}
 */
export function isExternalLibrary(path: string): boolean {
	return !path.startsWith(".") && !path.startsWith("/");
}

/**
 * Returns true if the given path represents an internal Typescript file
 * @param {string} path
 * @returns {boolean}
 */
export function isInternalFile(path: string): boolean {
	return DEFAULT_LIB_NAMES.has(path) || path.toLowerCase().endsWith(TSLIB_NAME);
}

/**
 * Returns true if the given id represents tslib
 * @param {string} path
 * @return {boolean}
 */
export function isTslib(path: string): boolean {
	return path === "tslib" || path.endsWith(`/tslib/${TSLIB_NAME}`) || path.endsWith("/tslib/tslib.es6.js") || path.endsWith("/tslib/tslib.js");
}

/**
 * Returns true if the given path represents a Babel helper
 * @param {string} path
 * @returns {boolean}
 */
export function isBabelHelper(path: string): boolean {
	return isBabelEsmHelper(path) || isBabelCjsHelper(path);
}

/**
 * Returns true if the given path represents a Babel ESM helper
 * @param {string} path
 * @returns {boolean}
 */
export function isBabelEsmHelper(path: string): boolean {
	return path.includes(`${BABEL_RUNTIME_PREFIX_1}helpers/esm`) || path.includes(`${BABEL_RUNTIME_PREFIX_2}helpers/esm`);
}

/**
 * Returns true if the given path represents a Babel CJS helper
 * @param {string} path
 * @returns {boolean}
 */
export function isBabelCjsHelper(path: string): boolean {
	return !isBabelEsmHelper(path) && (path.includes(`${BABEL_RUNTIME_PREFIX_1}helpers`) || path.includes(`${BABEL_RUNTIME_PREFIX_2}helpers`));
}

/**
 * Returns true if the given path represents @babel/preset-env
 * @param {string} path
 * @return {boolean}
 */
export function isBabelPresetEnv(path: string): boolean {
	return path.includes("@babel/preset-env") || path.includes("babel-preset-env");
}

/**
 * Returns true if the given path represents the entry point for rollup-plugin-multi-entry
 * @param {string} path
 * @return {boolean}
 */
export function isRollupPluginMultiEntry(path: string): boolean {
	return path === ROLLUP_PLUGIN_MULTI_ENTRY;
}

/**
 * Returns true if the given path represents @babel/preset-es[2015|2016|2017]
 * @param {string} path
 * @return {boolean}
 */
export function isYearlyBabelPreset(path: string): boolean {
	return path.includes("@babel/preset-es") || path.includes("babel-preset-es");
}

/**
 * Returns true if the given path represents @babel/plugin-transform-runtime
 * @param {string} path
 * @return {boolean}
 */
export function isBabelPluginTransformRuntime(path: string): boolean {
	return path.includes("@babel/plugin-transform-runtime") || path.includes("babel-plugin-transform-runtime");
}

/**
 * Strips the extension from a file
 * @param {string} file
 * @returns {string}
 */
export function stripKnownExtension(file: string): string {
	let currentExtname: string | undefined;

	for (const extName of KNOWN_EXTENSIONS) {
		if (file.endsWith(extName)) {
			currentExtname = extName;
			break;
		}
	}

	if (currentExtname == null) return file;

	return file.slice(0, file.lastIndexOf(currentExtname));
}

/**
 * Sets the given extension for the given file
 * @param {string} file
 * @param {string} extension
 * @returns {string}
 */
export function setExtension(file: string, extension: string): string {
	return normalize(`${stripKnownExtension(file)}${extension}`);
}

/**
 * Ensure that the given path has a leading "."
 * @param {string} path
 * @param {boolean} [externalGuard=true]
 * @return {string}
 */
export function ensureHasLeadingDotAndPosix(path: string, externalGuard: boolean = true): string {
	if (externalGuard && isExternalLibrary(path)) return path;

	const posixPath = ensurePosix(path);
	if (posixPath.startsWith(".")) return posixPath;
	if (posixPath.startsWith("/")) return `.${posixPath}`;
	return `./${posixPath}`;
}

/**
 * Ensures that the given path is relative
 * @param {string} root
 * @param {string} path
 * @returns {string}
 */
export function ensureRelative(root: string, path: string): string {
	// If the path is already relative, simply return it
	if (!isAbsolute(path)) {
		return path;
	}

	// Otherwise, construct a relative path from the root
	return relative(root, path);
}

/**
 * Ensures that the given path is absolute
 * @param {string} root
 * @param {string} path
 * @returns {string}
 */
export function ensureAbsolute(root: string, path: string): string {
	// If the path is already absolute, simply return it
	if (isAbsolute(path)) {
		return path;
	}

	// Otherwise, construct an absolute path from the root
	return join(root, path);
}
