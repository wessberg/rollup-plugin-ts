import {statSync} from "fs";
import {TS} from "../../type/ts";
import path from "crosspath";

export interface FileSystem {
	newLine: string;
	useCaseSensitiveFileNames: boolean;
	fileExists(path: string): boolean;
	readFile(path: string, encoding?: string): string | undefined;
	writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;
	readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): readonly string[];
	ensureDirectory(path: string): string;
	realpath(path: string): string;
	getDirectories(path: string): string[];
	directoryExists(path: string): boolean;
}

export function getRealFileSystem(typescript: typeof TS): FileSystem {
	return {
		...typescript.sys,
		realpath(p: string): string {
			return typescript.sys.realpath == null ? p : typescript.sys.realpath(p);
		},
		ensureDirectory(p: string): string {
			return statSync(p).isDirectory() ? p : path.native.dirname(p);
		}
	};
}
