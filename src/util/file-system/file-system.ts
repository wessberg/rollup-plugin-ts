import {existsSync, PathLike, readFileSync as _readFileSync, WriteFileOptions, writeFileSync as _writeFileSync, statSync} from "fs";
import {platform as platformFunction} from "os";
import {swapCase} from "../string/string-util";
import {sync} from "mkdirp";
import {dirname} from "path";

const platform = platformFunction();

export const readFileSync = _readFileSync;
export const fileExistsSync = existsSync;

/**
 * Ensures that the given path is a directory
 * @param {string} path
 * @returns {string}
 */
export function ensureDirectory (path: string): string {
	return statSync(path).isDirectory() ? path : dirname(path);
}

/**
 * Writes a file to disk and makes sure to create the directories leading up to the path if need-be
 * @param {PathLike | number} path
 * @param {T} data
 * @param {WriteFileOptions} options
 */
export function writeFileSync<T> (path: PathLike | number, data: T, options?: WriteFileOptions): void {
	if (typeof path === "string") sync(dirname(path));
	return _writeFileSync(path, data, options);
}

// tslint:disable:no-any

/**
 * Is true if the given file system is case sensitive
 * @returns {boolean}
 */
export const IS_FILE_SYSTEM_CASE_SENSITIVE: boolean = (() => {
	// win32\win64 are case insensitive platforms
	if (platform === "win32" || (<any>platform) === "win64") {
		return false;
	}
	// If this file exists under a different case, we must be case-insensitive.
	return !existsSync(swapCase(__filename));
})();