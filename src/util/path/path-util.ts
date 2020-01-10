import {basename, dirname, extname, isAbsolute, join, normalize, parse, ParsedPath, relative} from "path";
import {
	BABEL_RUNTIME_PREFIX_1,
	BABEL_RUNTIME_PREFIX_2,
	D_TS_EXTENSION,
	D_TS_MAP_EXTENSION,
	KNOWN_EXTENSIONS,
	NODE_MODULES,
	NODE_MODULES_MATCH_PATH,
	ROLLUP_PLUGIN_MULTI_ENTRY,
	TSLIB_NAME
} from "../../constant/constant";
import slash from "slash";

function _relative(from: string, to: string): string {
	return ensurePosix(relative(from, to));
}

function _join(...paths: string[]): string {
	return ensurePosix(join(...paths));
}

function _normalize(p: string): string {
	return ensurePosix(p);
}

function _dirname(p: string): string {
	return ensurePosix(dirname(p));
}

function _basename(p: string): string {
	return ensurePosix(basename(p));
}

function _extname(p: string): string {
	return extname(p);
}

function _parse(path: string): ParsedPath {
	return parse(path);
}

export function isTypeScriptLib(path: string): boolean {
	return path.startsWith(`lib.`) && path.endsWith(D_TS_EXTENSION);
}

/**
 * Ensures that the given path follows posix file names
 */
export function ensurePosix(path: string): string {
	return slash(path);
}

export function nativeNormalize(path: string): string {
	// Converts to either POSIX or native Windows file paths
	return normalize(path);
}

export function nativeDirname(path: string): string {
	return dirname(path);
}

export function nativeJoin(...paths: string[]): string {
	return join(...paths);
}

export function _isAbsolute(path: string): boolean {
	return isAbsolute(path);
}

/**
 * Gets the extension of the given file
 */
export function getExtension(file: string): string {
	if (file.endsWith(D_TS_EXTENSION)) return D_TS_EXTENSION;
	else if (file.endsWith(D_TS_MAP_EXTENSION)) return D_TS_MAP_EXTENSION;
	return extname(file);
}

/**
 * Returns true if the given path represents an external library
 */
export function isExternalLibrary(path: string): boolean {
	return (!path.startsWith(".") && !path.startsWith("/")) || path.includes(NODE_MODULES_MATCH_PATH);
}

/**
 * Returns true if the given path represents an internal Typescript file
 */
export function isInternalFile(path: string): boolean {
	return isTypeScriptLib(path) || path.toLowerCase().endsWith(TSLIB_NAME);
}

/**
 * Returns true if the given id represents tslib
 */
export function isTslib(path: string): boolean {
	return (
		path === "tslib" ||
		_normalize(path).endsWith(`/tslib/${TSLIB_NAME}`) ||
		_normalize(path).endsWith("/tslib/tslib.es6.js") ||
		_normalize(path).endsWith("/tslib/tslib.js")
	);
}

/**
 * Returns true if the given path represents a Babel helper
 */
export function isBabelHelper(path: string): boolean {
	return includesBabelEsmHelper(path) || isBabelCjsHelper(path);
}

/**
 * Returns true if the given path represents an internal core-js file.
 * This is relevant when combining Babel's preset-env with 'useBuiltIns' with values other than false.
 */
export function isCoreJsInternals(path: string): boolean {
	const normalizedPath = _normalize(path);
	return normalizedPath.includes(NODE_MODULES) && normalizedPath.includes("core-js/");
}

/**
 * Returns true if the given path represents a Babel ESM helper
 */
export function includesBabelEsmHelper(path: string): boolean {
	return _normalize(path).includes(`${BABEL_RUNTIME_PREFIX_1}helpers/esm`) || _normalize(path).includes(`${BABEL_RUNTIME_PREFIX_2}helpers/esm`);
}

/**
 * Returns true if the given path represents a Babel CJS helper
 */
export function isBabelCjsHelper(path: string): boolean {
	return (
		!includesBabelEsmHelper(path) &&
		(_normalize(path).includes(`${BABEL_RUNTIME_PREFIX_1}helpers`) || _normalize(path).includes(`${BABEL_RUNTIME_PREFIX_2}helpers`))
	);
}

/**
 * Returns true if the given path represents @babel/preset-env
 */
export function isBabelPresetEnv(path: string): boolean {
	return _normalize(path).includes("@babel/preset-env") || _normalize(path).includes("babel-preset-env");
}

/**
 * Returns true if the given path represents the entry point for rollup-plugin-multi-entry
 */
export function isRollupPluginMultiEntry(path: string): boolean {
	return _normalize(path) === ROLLUP_PLUGIN_MULTI_ENTRY;
}

/**
 * Returns true if the given path represents @babel/preset-es[2015|2016|2017]
 */
export function isYearlyBabelPreset(path: string): boolean {
	return _normalize(path).includes("@babel/preset-es") || _normalize(path).includes("babel-preset-es");
}

/**
 * Returns true if the given path represents @babel/plugin-transform-runtime
 */
export function isBabelPluginTransformRuntime(path: string): boolean {
	return _normalize(path).includes("@babel/plugin-transform-runtime") || _normalize(path).includes("babel-plugin-transform-runtime");
}

export function somePathsAreRelated(paths: Iterable<string>, matchPath: string): boolean {
	for (const path of paths) {
		if (pathsAreRelated(path, matchPath)) return true;
	}
	return false;
}

export function pathsAreRelated(pathA: string, pathB: string): boolean {
	if (pathA === pathB) return true;

	// A node_modules folder may contain one or more nested node_modules
	if (pathA.includes(NODE_MODULES) || pathB.includes(NODE_MODULES)) {
		const pathAFromNodeModules = pathA.includes(NODE_MODULES) ? pathA.slice(pathA.indexOf(NODE_MODULES)) : pathA;
		const pathBFromNodeModules = pathB.includes(NODE_MODULES) ? pathB.slice(pathB.indexOf(NODE_MODULES)) : pathB;

		if (pathAFromNodeModules.includes(pathBFromNodeModules)) return true;
		if (pathBFromNodeModules.includes(pathAFromNodeModules)) return true;
	}

	return false;
}

/**
 * Strips the extension from a file
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
 */
export function setExtension(file: string, extension: string): string {
	return _normalize(`${stripKnownExtension(file)}${extension}`);
}

/**
 * Ensure that the given path has a leading "."
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
 */
export function ensureRelative(root: string, path: string): string {
	// If the path is already relative, simply return it
	if (!_isAbsolute(path)) {
		return _normalize(path);
	}

	// Otherwise, construct a relative path from the root
	return _relative(root, path);
}

/**
 * Ensures that the given path is absolute
 */
export function ensureAbsolute(root: string, path: string): string {
	// If the path is already absolute, simply return it
	if (_isAbsolute(path)) {
		return _normalize(path);
	}

	// Otherwise, construct an absolute path from the root
	return _join(root, path);
}

export {
	_relative as relative,
	_join as join,
	_normalize as normalize,
	_dirname as dirname,
	_basename as basename,
	_extname as extname,
	_isAbsolute as isAbsolute,
	_parse as parse
};
