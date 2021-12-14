import * as fsModule from "fs";
import * as osModule from "os";
import {TS} from "../../src/type/ts";
import path from "crosspath";
import {FileSystem} from "../../src/util/file-system/file-system";
import {OS} from "../../src/util/os/os";
import { PartialExcept } from "helpertypes";

/**
 * TypeScript has a lot of internal helpers that aren't exposed.
 * We're using a lot of them within this file since we've been forced to essentially
 * reimplement the majority of the TypeScript logic that constructs a new System in
 * order to extend it with the option to pass a custom FS implementation.
 * @link {https://github.com/microsoft/TypeScript/issues/44379} See this issue for more details
 */

type TSExtended = typeof TS & {
	normalizePath(p: string): string;
	combinePaths(a: string, b: string): string;
	getRegularExpressionForWildcard(specs: readonly string[] | undefined, basePath: string, usage: "files" | "directories" | "exclude"): string;
	getRegularExpressionsForWildcards(specs: readonly string[] | undefined, basePath: string, usage: "files" | "directories" | "exclude"): string[];
	map<T, U>(arr: T[], mapper: (T: string) => U): U[];
	isRootedDiskPath(p: string): boolean;
	indexOfAnyCharCode(absolute: string, wildcardCharCodes: number[]): number;
	hasExtension(p: string): boolean;
	getDirectoryPath(p: string): string;
	removeTrailingDirectorySeparator(p: string): string;
	readonly directorySeparator: string;
	getStringComparer(ignoreCase: boolean): (a: string, b: string) => number;
	every<T>(arr: T[], cb: (item: T) => boolean): boolean;
	containsPath(parent: string, child: string, currentDirectory: string, ignoreCase: boolean): boolean;
	getRegexFromPattern(pattern: string, useCaseSensitiveFileNames: boolean): RegExp;
	createGetCanonicalFileName(useCaseSensitiveFileNames: boolean): (p: string) => string;
	fileExtensionIsOneOf(file: string, extensions: readonly string[]): boolean;
	compareStringsCaseSensitive(a: string, b: string): number;
};

export interface CreateTypeScriptSystemOptions {
	// An FS implementation
	fs: FileSystem;

	// These are the only two properties you use from the os module
	os: OS;

	// You default to using process.cwd() here, but the current working directory could in theory be something else
	cwd: string;

	// Defaults to __filename
	executingFileName: string;

	/**
	 * The TypeScript instance to use
	 */
	typescript: typeof TS;
}

/**
 * Constructs a new System based on the provided arguments.
 * Most of the logic here is directly copied over from TypeScript, but it also relies on a lot of internal TypeScript helpers.
 * This is hopefully temporary until TypeScript provides ways to construct a new System via an exposed helper function.
 * @link {https://github.com/microsoft/TypeScript/issues/44379} See this issue for more details
 */
export function createTypeScriptSystem({
	typescript: _typescript,
	fs = fsModule,
	os = osModule,
	cwd = process.cwd(),
	executingFileName = __filename
}: PartialExcept<CreateTypeScriptSystemOptions, "typescript">): TS.System {
	const typescript = _typescript as TSExtended;
	const wildcardCharCodes = [42, 63];
	const platform = os.platform();
	const byteOrderMarkIndicator = "\uFEFF";

	function statSync(p: string) {
		// throwIfNoEntry will be ignored by older versions of node
		return fs.statSync(p, {throwIfNoEntry: false});
	}

	function fileSystemEntryExists(p: string, entryKind: 0 | 1) {
		// Since the error thrown by fs.statSync isn't used, we can avoid collecting a stack trace to improve
		// the CPU time performance.
		const originalStackTraceLimit = Error.stackTraceLimit;
		Error.stackTraceLimit = 0;

		try {
			const stat = statSync(p);
			if (!stat) {
				return false;
			}
			switch (entryKind) {
				case 0 /* File */:
					return stat.isFile();
				case 1 /* Directory */:
					return stat.isDirectory();
				default:
					return false;
			}
		} catch (e) {
			return false;
		} finally {
			Error.stackTraceLimit = originalStackTraceLimit;
		}
	}
	function fileExists(p: string) {
		return fileSystemEntryExists(p, 0 /* File */);
	}
	function directoryExists(p: string) {
		return fileSystemEntryExists(p, 1 /* Directory */);
	}

	/**
	 * Taken directly from TypeScript internals
	 */
	function swapCase(s: string) {
		return s.replace(/\w/g, ch => {
			const up = ch.toUpperCase();
			return ch === up ? ch.toLowerCase() : up;
		});
	}

	/**
	 * Taken directly from TypeScript internals
	 */
	function isFileSystemCaseSensitive() {
		// win32\win64 are case insensitive platforms
		if (platform === "win32") {
			return false;
		}
		// If this file exists under a different case, we must be case-insensitive.
		return !fileExists(swapCase(executingFileName));
	}

	const useCaseSensitiveFileNames = isFileSystemCaseSensitive();
	const newLine = os.EOL;

	/**
	 * Taken directly from TypeScript internals
	 */
	const realpathSync = useCaseSensitiveFileNames && fs.realpathSync.native != null ? fs.realpathSync.native : fs.realpathSync;

	function realpath(p: string): string {
		return realpathSync(p);
	}

	function getCurrentDirectory(): string {
		return cwd;
	}

	function resolvePath(p: string) {
		return path.resolve(p);
	}

	/**
	 * Taken directly from TypeScript internals
	 */
	function readFile(fileName: string): string | undefined {
		let buffer;
		try {
			buffer = fs.readFileSync(fileName);
		} catch (e) {
			return undefined;
		}
		let len = buffer.length;
		if (len >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
			// Big endian UTF-16 byte order mark detected. Since big endian is not supported by node.js,
			// flip all byte pairs and treat as little endian.
			len &= ~1; // Round down to a multiple of 2
			for (let i = 0; i < len; i += 2) {
				const temp = buffer[i];
				buffer[i] = buffer[i + 1];
				buffer[i + 1] = temp;
			}
			return buffer.toString("utf16le", 2);
		}
		if (len >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
			// Little endian UTF-16 byte order mark detected
			return buffer.toString("utf16le", 2);
		}
		if (len >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
			// UTF-8 byte order mark detected
			return buffer.toString("utf8", 3);
		}
		// Default is UTF-8 with no byte order mark
		return buffer.toString("utf8");
	}

	function deleteFile(p: string) {
		try {
			return fs.unlinkSync(p);
		} catch (e) {
			return;
		}
	}

	function getIncludeBasePath(absolute: string) {
		const wildcardOffset = typescript.indexOfAnyCharCode(absolute, wildcardCharCodes);
		if (wildcardOffset < 0) {
			// No "*" or "?" in the path
			return !typescript.hasExtension(absolute) ? absolute : typescript.removeTrailingDirectorySeparator(typescript.getDirectoryPath(absolute));
		}
		return absolute.substring(0, absolute.lastIndexOf(typescript.directorySeparator, wildcardOffset));
	}

	function getBasePaths(p: string, includes: readonly string[] | undefined, caseSensitiveFileNames: boolean) {
		// Storage for our results in the form of literal paths (e.g. the paths as written by the user).
		const basePaths = [p];
		if (includes) {
			// Storage for literal base paths amongst the include patterns.
			const includeBasePaths = [];
			let _i = 0;
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const includes_1 = includes;
			for (; _i < includes_1.length; _i++) {
				const include = includes_1[_i];
				// We also need to check the relative paths by converting them to absolute and normalizing
				// in case they escape the base path (e.g "..\somedirectory")
				const absolute = typescript.isRootedDiskPath(include) ? include : typescript.normalizePath(typescript.combinePaths(p, include));
				// Append the literal and canonical candidate base paths.
				includeBasePaths.push(getIncludeBasePath(absolute));
			}
			// Sort the offsets array using either the literal or canonical path representations.
			includeBasePaths.sort(typescript.getStringComparer(!caseSensitiveFileNames));
			const _loop_2 = (includeBasePath: string) => {
				if (typescript.every(basePaths, basePath => !typescript.containsPath(basePath, includeBasePath, p, !caseSensitiveFileNames))) {
					basePaths.push(includeBasePath);
				}
			};
			// Iterate over each include base path and include unique base paths that are not a
			// subpath of an existing base path
			let _a = 0;
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const includeBasePaths_1 = includeBasePaths;
			for (; _a < includeBasePaths_1.length; _a++) {
				const includeBasePath = includeBasePaths_1[_a];
				_loop_2(includeBasePath);
			}
		}
		return basePaths;
	}

	function getFileMatcherPatterns(
		p: string,
		excludes: readonly string[] | undefined,
		includes: readonly string[] | undefined,
		caseSensitiveFileNames: boolean,
		currentDirectory: string
	) {
		p = typescript.normalizePath(p);
		currentDirectory = typescript.normalizePath(currentDirectory);
		const absolutePath = typescript.combinePaths(currentDirectory, p);
		return {
			includeFilePatterns: typescript.map(typescript.getRegularExpressionsForWildcards(includes, absolutePath, "files"), pattern => "^" + pattern + "$"),
			includeFilePattern: typescript.getRegularExpressionForWildcard(includes, absolutePath, "files"),
			includeDirectoryPattern: typescript.getRegularExpressionForWildcard(includes, absolutePath, "directories"),
			excludePattern: typescript.getRegularExpressionForWildcard(excludes, absolutePath, "exclude"),
			basePaths: getBasePaths(p, includes, caseSensitiveFileNames)
		};
	}

	function matchFiles(
		p: string,
		extensions: readonly string[] | undefined,
		excludes: readonly string[] | undefined,
		includes: readonly string[] | undefined,
		caseSensitiveFileNames: boolean,
		currentDirectory: string,
		depth: number | undefined
	): string[] {
		p = typescript.normalizePath(p);
		currentDirectory = typescript.normalizePath(currentDirectory);
		const patterns = getFileMatcherPatterns(p, excludes, includes, caseSensitiveFileNames, currentDirectory);
		const includeFileRegexes =
			// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
			patterns.includeFilePatterns &&
			patterns.includeFilePatterns.map(function (pattern) {
				return typescript.getRegexFromPattern(pattern, caseSensitiveFileNames);
			});
		const includeDirectoryRegex = patterns.includeDirectoryPattern && typescript.getRegexFromPattern(patterns.includeDirectoryPattern, caseSensitiveFileNames);
		const excludeRegex = patterns.excludePattern && typescript.getRegexFromPattern(patterns.excludePattern, caseSensitiveFileNames);
		// Associate an array of results with each include regex. This keeps results in order of the "include" order.
		// If there are no "includes", then just put everything in results[0].
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		const results: string[][] = includeFileRegexes
			? includeFileRegexes.map(function () {
					return [];
			  })
			: [[]];
		const visited = new Map();
		const toCanonical = typescript.createGetCanonicalFileName(caseSensitiveFileNames);
		for (let _i = 0, _a = patterns.basePaths; _i < _a.length; _i++) {
			const basePath = _a[_i];
			visitDirectory(basePath, typescript.combinePaths(currentDirectory, basePath), depth);
		}
		return results.flat(Infinity) as string[];

		function visitDirectory(p2: string, absolutePath: string, dep: number | undefined) {
			let current;
			const canonicalPath = toCanonical(realpath(absolutePath));
			if (visited.has(canonicalPath)) return;
			visited.set(canonicalPath, true);
			const _a = getAccessibleFileSystemEntries(p2);
			const files = _a.files;
			const directories = _a.directories;
			const _loop_1 = (curr: string): void | "continue" => {
				const name = typescript.combinePaths(p2, curr);
				const absoluteName = typescript.combinePaths(absolutePath, curr);
				if (extensions && !typescript.fileExtensionIsOneOf(name, extensions)) return "continue";
				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				if (excludeRegex && excludeRegex.test(absoluteName)) return "continue";
				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				if (!includeFileRegexes) {
					results[0].push(name);
				} else {
					const includeIndex = includeFileRegexes.findIndex(re => re.test(absoluteName));
					if (includeIndex !== -1) {
						results[includeIndex].push(name);
					}
				}
			};
			let _i = 0;
			const _b = [...files].sort(typescript.compareStringsCaseSensitive);
			for (; _i < _b.length; _i++) {
				current = _b[_i];
				_loop_1(current);
			}
			if (dep !== undefined) {
				dep--;
				if (dep === 0) {
					return;
				}
			}
			let _c = 0;
			const _d = [...directories].sort(typescript.compareStringsCaseSensitive);
			for (; _c < _d.length; _c++) {
				current = _d[_c];
				const name = typescript.combinePaths(p2, current);
				const absoluteName = typescript.combinePaths(absolutePath, current);
				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				if ((!includeDirectoryRegex || includeDirectoryRegex.test(absoluteName)) && (!excludeRegex || !excludeRegex.test(absoluteName))) {
					visitDirectory(name, absoluteName, dep);
				}
			}
		}
	}

	function readDirectory(p: string, extensions?: readonly string[], excludes?: readonly string[], includes?: readonly string[], depth?: number): string[] {
		return matchFiles(p, extensions, excludes, includes, useCaseSensitiveFileNames, cwd, depth);
	}

	function getDirectories(p: string) {
		return getAccessibleFileSystemEntries(p).directories.slice();
	}

	function getAccessibleFileSystemEntries(p: string) {
		try {
			const entries = fs.readdirSync(p || ".", {withFileTypes: true});
			const files = [];
			const directories = [];
			let _i = 0;
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const entries_1 = entries;
			for (; _i < entries_1.length; _i++) {
				const dirent = entries_1[_i];
				// withFileTypes is not supported before Node 10.10.
				const entry = typeof dirent === "string" ? dirent : dirent.name;
				// This is necessary because on some file system node fails to exclude
				// "." and "..". See https://github.com/nodejs/node/issues/4002
				if (entry === "." || entry === "..") {
					continue;
				}
				let stat: fsModule.Dirent | fsModule.Stats | undefined = void 0;
				if (typeof dirent === "string" || dirent.isSymbolicLink()) {
					const name = typescript.combinePaths(p, entry);
					try {
						stat = statSync(name);
						if (!stat) {
							continue;
						}
					} catch (e) {
						continue;
					}
				} else {
					stat = dirent;
				}
				if (stat.isFile()) {
					files.push(entry);
				} else if (stat.isDirectory()) {
					directories.push(entry);
				}
			}
			files.sort();
			directories.sort();
			return {files: files, directories: directories};
		} catch (e) {
			return {
				files: [],
				directories: []
			};
		}
	}

	/**
	 * Taken directly from TypeScript internals
	 */
	function writeFile(fileName: string, data: string | Buffer, writeByteOrderMark = false): void {
		// If a BOM is required, emit one
		if (writeByteOrderMark) {
			data = byteOrderMarkIndicator + data;
		}
		fs.writeFileSync(fileName, data, {encoding: "utf8"});
	}

	function createDirectory(directoryName: string): void {
		if (!directoryExists(directoryName)) {
			// Wrapped in a try-catch to prevent crashing if we are in a race
			// with another copy of ourselves to create the same directory
			try {
				fs.mkdirSync(directoryName);
			} catch (e) {
				if (e == null || !(e instanceof Error) || (e as Error & {code: string}).code !== "EEXIST") {
					// Failed for some other reason (access denied?); still throw
					throw e;
				}
			}
		}
	}

	return {
		...typescript.sys,
		realpath,
		newLine,
		useCaseSensitiveFileNames,
		getCurrentDirectory,
		readFile,
		writeFile,
		resolvePath,
		fileExists,
		directoryExists,
		createDirectory,
		getExecutingFilePath: () => executingFileName,
		readDirectory,
		getDirectories,
		deleteFile,
		getFileSize: () => 0
	};
}
