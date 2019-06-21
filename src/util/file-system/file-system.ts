import {PathLike, statSync, WriteFileOptions, writeFileSync as _writeFileSync} from "fs";
import {sync} from "mkdirp";
import {dirname} from "path";
import {sys} from "typescript";

export interface FileSystem {
	newLine: string;
	useCaseSensitiveFileNames: boolean;
	fileExists(path: string): boolean;
	readFile(path: string, encoding?: string): string | undefined;
	ensureDirectory(path: string): string;
	writeFileSync<T>(path: PathLike | number, data: T, options?: WriteFileOptions): void;
	readDirectory(
		path: string,
		extensions?: ReadonlyArray<string>,
		exclude?: ReadonlyArray<string>,
		include?: ReadonlyArray<string>,
		depth?: number
	): string[];
	realpath(path: string): string;
	getDirectories(path: string): string[];
	directoryExists(path: string): boolean;
}

export const REAL_FILE_SYSTEM: FileSystem = {
	...sys,
	realpath(path: string): string {
		return sys.realpath == null ? path : sys.realpath(path);
	},
	ensureDirectory(path: string): string {
		return statSync(path).isDirectory() ? path : dirname(path);
	},
	writeFileSync<T>(path: PathLike | number, data: T, options?: WriteFileOptions): void {
		if (typeof path === "string") sync(dirname(path));
		return _writeFileSync(path, data, options);
	}
};
