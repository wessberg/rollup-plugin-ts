import {dirname, join} from "path";
import {getExtension, setExtension} from "../path/path-util";

/**
 * Tries to find an absolute path
 * @param {string} moduleSpecifier
 * @param {string[]} supportedExtensions
 * @param {string[]} moduleNames
 * @return {string}
 */
export function tryFindAbsolutePath(moduleSpecifier: string, supportedExtensions: string[], moduleNames: string[]): string {
	const dirs = [...new Set(moduleNames.map(dirname))];

	// If it already has an extension, try to find an exact match
	const hasExtension = getExtension(moduleSpecifier) !== "";

	// Otherwise, try for each extension
	for (const dir of dirs) {
		const path = join(dir, moduleSpecifier);
		if (hasExtension && moduleNames.some(moduleName => moduleName === path)) return path;

		for (const extension of supportedExtensions) {
			const joined = setExtension(path, extension);
			if (moduleNames.some(moduleName => moduleName === joined)) {
				return joined;
			}
		}
	}

	return "";
}
