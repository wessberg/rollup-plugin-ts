import path from "crosspath";
import {
	BABEL_RUNTIME_PREFIX_1,
	BABEL_RUNTIME_PREFIX_2,
	D_TS_EXTENSION,
	D_TS_MAP_EXTENSION,
	KNOWN_EXTENSIONS,
	NODE_MODULES,
	NODE_MODULES_MATCH_PATH,
	REGENERATOR_RUNTIME_NAME_1,
	REGENERATOR_RUNTIME_NAME_2,
	REGENERATOR_RUNTIME_NAME_3,
	REGENERATOR_RUNTIME_VIRTUAL_SRC,
	ROLLUP_PLUGIN_MULTI_ENTRY_LEGACY,
	SWC_HELPERS_PREFIX,
	TSLIB_NAME
} from "../../constant/constant.js";
import type {ExternalOption} from "rollup";
import {ensureArray} from "../ensure-array/ensure-array.js";
import {createRequire} from "module";

// Until import.meta.resolve becomes stable, we'll have to do this instead
export const resolveModule = (id: string, from: string = import.meta.url) => createRequire(from).resolve(id);

export function isTypeScriptLib(p: string): boolean {
	return p.startsWith(`lib.`) && p.endsWith(D_TS_EXTENSION);
}

export function removeSearchPathFromFilename(p: string): string {
	if (p.includes(`?`)) {
		return p.slice(0, p.indexOf(`?`));
	}
	return p;
}

/**
 * Gets the extension of the given file
 */
export function getExtension(file: string): string {
	if (file.endsWith(D_TS_EXTENSION)) return D_TS_EXTENSION;
	else if (file.endsWith(D_TS_MAP_EXTENSION)) return D_TS_MAP_EXTENSION;
	return path.extname(file);
}

/**
 * Returns true if the given path represents an external library
 */
export function isExternalLibrary(p: string): boolean {
	return (!p.startsWith(".") && !p.startsWith("/")) || p.includes(NODE_MODULES_MATCH_PATH);
}

export function stripNodePrefixFromModuleSpecifier(moduleSpecifier: string): string {
	return moduleSpecifier.startsWith("node:") ? moduleSpecifier.slice("node:".length) : moduleSpecifier;
}

/**
 * Returns true if the given id represents tslib
 */
export function isTslib(p: string): boolean {
	return p === "tslib" || path.normalize(p).endsWith(`/tslib/${TSLIB_NAME}`) || path.normalize(p).endsWith("/tslib/tslib.es6.js") || path.normalize(p).endsWith("/tslib/tslib.js");
}

/**
 * Returns true if the given path represents a Babel helper
 */
export function isBabelHelper(p: string): boolean {
	return includesBabelEsmHelper(p) || isBabelCjsHelper(p);
}

export function isRegeneratorRuntime(p: string): boolean {
	return p.endsWith(REGENERATOR_RUNTIME_NAME_1) || p.endsWith(REGENERATOR_RUNTIME_NAME_2) || p.endsWith(REGENERATOR_RUNTIME_NAME_3) || p === REGENERATOR_RUNTIME_VIRTUAL_SRC;
}

/**
 * Returns true if the given path represents a swc helper
 */
export function isSwcHelper(p: string): boolean {
	return path.normalize(p).includes(`${SWC_HELPERS_PREFIX}`);
}

/**
 * Returns true if the given path represents a Babel ESM helper
 */
export function includesBabelEsmHelper(p: string): boolean {
	return path.normalize(p).includes(`${BABEL_RUNTIME_PREFIX_1}helpers/esm`) || path.normalize(p).includes(`${BABEL_RUNTIME_PREFIX_2}helpers/esm`);
}

/**
 * Returns true if the given path represents a Babel CJS helper
 */
export function isBabelCjsHelper(p: string): boolean {
	return !includesBabelEsmHelper(p) && (path.normalize(p).includes(`${BABEL_RUNTIME_PREFIX_1}helpers`) || path.normalize(p).includes(`${BABEL_RUNTIME_PREFIX_2}helpers`));
}

/**
 * Returns true if the given path represents @babel/preset-env
 */
export function isBabelPresetEnv(p: string): boolean {
	return path.normalize(p).includes("@babel/preset-env") || path.normalize(p).includes("babel-preset-env");
}

/**
 * Returns true if the given path represents @babel/preset-typescript
 */
export function isBabelPresetTypescript(p: string): boolean {
	return path.normalize(p).includes("@babel/preset-typescript");
}

/**
 * Returns true if the given path is the name of the entry module or @rollup/plugin-multi-entry
 */
export function isMultiEntryModule(p: string, multiEntryModuleName: string | undefined): boolean {
	const normalized = path.normalize(p);
	return normalized === ROLLUP_PLUGIN_MULTI_ENTRY_LEGACY || (multiEntryModuleName != null && normalized === multiEntryModuleName);
}

/**
 * Returns true if the given path represents @babel/preset-es[2015|2016|2017]
 */
export function isYearlyBabelPreset(p: string): boolean {
	return path.normalize(p).includes("@babel/preset-es") || path.normalize(p).includes("babel-preset-es");
}

/**
 * Returns true if the given path represents @babel/plugin-transform-runtime
 */
export function isBabelPluginTransformRuntime(p: string): boolean {
	return path.normalize(p).includes("@babel/plugin-transform-runtime") || path.normalize(p).includes("babel-plugin-transform-runtime");
}

export function somePathsAreRelated(paths: Iterable<string>, matchPath: string): boolean {
	for (const p of paths) {
		if (pathsAreRelated(p, matchPath)) return true;
	}
	return false;
}

export function pathsAreRelated(a: string, b: string): boolean {
	if (a === b) return true;

	// A node_modules folder may contain one or more nested node_modules
	if (a.includes(NODE_MODULES) || b.includes(NODE_MODULES)) {
		const firstPathFromNodeModules = a.includes(NODE_MODULES) ? a.slice(a.indexOf(NODE_MODULES)) : a;
		const secondPathFromNodeModules = b.includes(NODE_MODULES) ? b.slice(b.indexOf(NODE_MODULES)) : b;

		if (firstPathFromNodeModules.includes(secondPathFromNodeModules)) return true;
		if (secondPathFromNodeModules.includes(firstPathFromNodeModules)) return true;
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
	return path.normalize(`${stripKnownExtension(file)}${extension}`);
}

/**
 * Ensure that the given path has a leading "."
 */
export function ensureHasLeadingDotAndPosix(p: string, externalGuard = true): string {
	if (externalGuard && isExternalLibrary(p)) return p;

	const posixPath = path.normalize(p);
	if (posixPath.startsWith(".")) return posixPath;
	if (posixPath.startsWith("/")) return `.${posixPath}`;
	return `./${posixPath}`;
}

/**
 * Ensure that the given path has a leading "."
 */
export function ensureHasNoLeadingDotAndPosix(p: string): string {
	const posixPath = path.normalize(p);
	if (posixPath.startsWith("./")) return posixPath.slice(2);
	return posixPath;
}

/**
 * Ensures that the given path is relative
 */
export function ensureRelative(root: string, p: string): string {
	// If the path is already relative, simply return it
	if (!path.isAbsolute(p)) {
		return path.normalize(p);
	}

	// Otherwise, construct a relative path from the root
	return path.relative(root, p);
}

/**
 * Ensures that the given path is absolute
 */
export function ensureAbsolute(root: string, p: string): string {
	// If the path is already absolute, simply return it
	if (path.isAbsolute(p)) {
		return path.normalize(p);
	}

	// Otherwise, construct an absolute path from the root
	return path.join(root, p);
}

/**
 * Checks the id from the given importer with respect to the given externalOption provided to Rollup
 */
export function isExternal(id: string, importer: string, externalOption: ExternalOption | undefined | boolean): boolean {
	if (externalOption == null) return false;
	if (externalOption === true) return true;
	if (externalOption === false) return false;
	if (typeof externalOption === "function") return externalOption(id, importer, true) ?? false;

	const ids = new Set<string>();
	const matchers: RegExp[] = [];
	for (const value of ensureArray(externalOption)) {
		if (value instanceof RegExp) {
			matchers.push(value);
		} else {
			ids.add(value);
		}
	}

	return ids.has(id) || matchers.some(matcher => matcher.test(id));
}
