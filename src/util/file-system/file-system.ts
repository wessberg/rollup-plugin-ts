import {statSync} from "fs";
import {dirname} from "path";
import {TS} from "../../type/ts";

export interface FileSystem {
	newLine: string;
	useCaseSensitiveFileNames: boolean;
	fileExists(path: string): boolean;
	readFile(path: string, encoding?: string): string | undefined;
	ensureDirectory(path: string): string;
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

export function getRealFileSystem(typescript: typeof TS): FileSystem {
	return {
		...typescript.sys,
		realpath(path: string): string {
			return typescript.sys.realpath == null ? path : typescript.sys.realpath(path);
		},
		ensureDirectory(path: string): string {
			return statSync(path).isDirectory() ? path : dirname(path);
		}
	};
}
