import {isAbsolute, join, parse, relative, extname} from "path";
import {
	DECLARATION_EXTENSION,
	DECLARATION_MAP_EXTENSION,
	JS_EXTENSION,
	JSX_EXTENSION,
	MJS_EXTENSION,
	TSX_EXTENSION,
	TS_EXTENSION,
	DEFAULT_LIB_NAMES,
	TSLIB_NAME,
	TYPEOF_BABEL_HELPER_NAME_1,
	TYPEOF_BABEL_HELPER_NAME_2,
	TYPEOF_BABEL_HELPER_NAME_3,
	TYPEOF_BABEL_HELPER_NAME_4
} from "../../constant/constant";

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
 * Returns true if the given path represents a Babel helper that shouldn't be transformed
 * @param {string} path
 * @returns {boolean}
 */
export function isNonTransformableBabelHelper(path: string): boolean {
	return path.endsWith(TYPEOF_BABEL_HELPER_NAME_1) || path.endsWith(TYPEOF_BABEL_HELPER_NAME_2) || path.endsWith(TYPEOF_BABEL_HELPER_NAME_3) || path.endsWith(TYPEOF_BABEL_HELPER_NAME_4);
}

/**
 * Strips the extension from a file
 * @param {string} file
 * @returns {string}
 */
export function stripExtension(file: string): string {
	if (extname(file) === "") return file;
	let {dir, name} = parse(file);

	if (name.endsWith(".d")) {
		name = name.slice(0, -2);
	}
	if (dir === ".") return `./${name}`;
	return join(dir, name);
}

/**
 * Sets the given extension for the given file
 * @param {string} file
 * @param {string} extension
 * @returns {string}
 */
export function setExtension(file: string, extension: string): string {
	return `${stripExtension(file)}${extension}`;
}

/**
 * Ensure that the given path has a leading "."
 * @param {string} path
 * @return {string}
 */
export function ensureHasLeadingDot(path: string): string {
	if (path.startsWith(".")) return path;
	if (path.startsWith("/")) return `.${path}`;
	return `./${path}`;
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

/**
 * Returns true if the given file is a Javascript file
 * @param {string} file
 * @returns {boolean}
 */
export function isJSFile(file: string): boolean {
	return file.endsWith(JS_EXTENSION) || file.endsWith(JSX_EXTENSION) || file.endsWith(MJS_EXTENSION);
}

/**
 * Returns true if the given file is a Typescript file
 * @param {string} file
 * @returns {boolean}
 */
export function isTSFile(file: string): boolean {
	return file.endsWith(TS_EXTENSION) || file.endsWith(TSX_EXTENSION);
}

/**
 * Returns true if the given file is a Typescript declaration (.d.ts) file
 * @param {string} file
 * @returns {boolean}
 */
export function isDTSFile(file: string): boolean {
	return file.endsWith(DECLARATION_EXTENSION);
}

/**
 * Returns true if the given file is a Typescript declaration map (.d.ts.map) file
 * @param {string} file
 * @returns {boolean}
 */
export function isDTSMapFile(file: string): boolean {
	return file.endsWith(DECLARATION_MAP_EXTENSION);
}

/**
 * Ensures that the given file ends with '.ts', no matter what it actually ends with
 * This is to support Typescript's language service with files that doesn't necessarily end with it.
 * @param {string} file
 * @returns {string}
 */
export function ensureTs(file: string): string {
	return setExtension(file, TS_EXTENSION);
}

/**
 * Ensures that the given file ends with '.js', no matter what it actually ends with
 * This is to support Typescript's language service with files that doesn't necessarily end with it.
 * @param {string} file
 * @returns {string}
 */
export function ensureJs(file: string): string {
	return setExtension(file, JS_EXTENSION);
}

/**
 * Replaces the extension of the given path with the extension of a declaration file
 * @param {string} file
 * @returns {string}
 */
export function ensureDTS(file: string): string {
	return setExtension(file, DECLARATION_EXTENSION);
}
