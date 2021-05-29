import {TS} from "../../type/ts";
import {ModuleResolutionHostOptions} from "./module-resolution-host-options";
import {ensureAbsolute} from "../../util/path/path-util";
import {FileSystem} from "../../util/file-system/file-system";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";
import {VirtualFile, VirtualFileInput} from "./virtual-file";
import {D_TS_EXTENSION, D_TS_MAP_EXTENSION} from "../../constant/constant";
import path from "crosspath";

export class ModuleResolutionHost implements TS.ModuleResolutionHost {
	private readonly directoryExistsCache: Map<string, boolean> = new Map();
	private readonly fileExistsCache: Map<string, boolean> = new Map();
	private currentFileNames: Set<string> | undefined;
	private currentDirectories: Set<string> | undefined;
	private currentNonAmbientSupportedExtensions: SupportedExtensions | undefined;
	constructor(protected readonly options: ModuleResolutionHostOptions, protected readonly files: Map<string, VirtualFile> = new Map()) {}

	add(fileInput: VirtualFileInput | VirtualFile): VirtualFile {
		const file = {
			...fileInput,
			transformedText: "transformedText" in fileInput && fileInput.transformedText != null ? fileInput.transformedText : fileInput.text
		};
		this.files.set(file.fileName, file);
		this.clearCaches(file.fileName);
		return file;
	}

	clearCaches(fileName?: string): void {
		if (fileName != null) {
			this.fileExistsCache.delete(fileName);
			this.directoryExistsCache.delete(path.dirname(fileName));
			this.currentFileNames = undefined;
			this.currentDirectories = undefined;
		} else {
			this.directoryExistsCache.clear();
			this.fileExistsCache.clear();
		}
	}

	delete(fileName: string): boolean {
		this.clearCaches(fileName);
		return this.files.delete(fileName);
	}

	has(fileName: string): boolean {
		return this.files.has(fileName);
	}

	get(fileName: string): VirtualFile | undefined {
		return this.files.get(fileName);
	}

	getFileNames(): Set<string> {
		if (this.currentFileNames == null) {
			this.currentFileNames = new Set(this.files.keys());
		}

		return this.currentFileNames;
	}

	getFileNameDirectories(): Set<string> {
		if (this.currentDirectories == null) {
			this.currentDirectories = new Set([...this.getFileNames()].map(fileName => path.dirname(fileName)));
		}

		return this.currentDirectories;
	}

	getRollupFileNames(): Set<string> {
		return new Set([...this.getFileNames()].filter(fileName => this.get(fileName)!.fromRollup));
	}

	getFileSystem(): FileSystem {
		return this.options.fileSystem;
	}

	getParsedCommandLine(): TS.ParsedCommandLine {
		return this.options.parsedCommandLineResult.parsedCommandLine;
	}

	getCompilationSettings(): TS.CompilerOptions {
		return this.getParsedCommandLine().options;
	}

	getSupportedExtensions(): SupportedExtensions {
		return this.options.extensions;
	}

	getSupportedNonAmbientExtensions(): SupportedExtensions {
		if (this.currentNonAmbientSupportedExtensions == null) {
			this.currentNonAmbientSupportedExtensions = new Set([...this.options.extensions].filter(extension => extension !== D_TS_EXTENSION && extension !== D_TS_MAP_EXTENSION));
		}
		return this.currentNonAmbientSupportedExtensions;
	}

	getTypescript(): typeof TS {
		return this.options.typescript;
	}

	getCwd(): string {
		return this.options.cwd;
	}

	/**
	 * Returns true if the given file exists
	 */
	fileExists(fileName: string): boolean {
		if (this.fileExistsCache.has(fileName)) {
			return this.fileExistsCache.get(fileName)!;
		}

		const exists = this.files.has(fileName) || this.getFileSystem().fileExists(path.native.normalize(fileName));
		this.fileExistsCache.set(fileName, exists);
		return exists;
	}

	/**
	 * Reads the given file
	 */
	readFile(fileName: string, encoding?: string): string | undefined {
		// Check if the file exists within the cached files and return it if so
		const result = this.files.get(fileName);
		if (result != null) return result.text;

		// Otherwise, try to properly resolve the file
		return this.getFileSystem().readFile(path.native.normalize(fileName), encoding);
	}

	/**
	 * Returns true if the given directory exists
	 */
	directoryExists(directoryName: string): boolean {
		if (this.directoryExistsCache.has(directoryName)) {
			return this.directoryExistsCache.get(directoryName)!;
		}
		const absoluteDirectoryName = ensureAbsolute(this.getCwd(), directoryName);
		const fileNameDirectories = this.getFileNameDirectories();

		const result =
			fileNameDirectories.has(directoryName) ||
			fileNameDirectories.has(absoluteDirectoryName) ||
			this.getFileSystem().directoryExists(path.native.normalize(directoryName)) ||
			this.getFileSystem().directoryExists(path.native.normalize(absoluteDirectoryName));
		this.directoryExistsCache.set(directoryName, result);
		return result;
	}

	/**
	 * Gets the real path for the given path. Meant to resolve symlinks
	 */
	realpath(p: string): string {
		return path.normalize(this.getFileSystem().realpath(path.native.normalize(p)));
	}

	/**
	 * Gets the current directory
	 */
	getCurrentDirectory(): string {
		return path.normalize(this.getCwd());
	}

	/**
	 * Gets all directories within the given directory path
	 */
	getDirectories(directoryName: string): string[] {
		return this.getFileSystem().getDirectories(path.native.normalize(directoryName)).map(path.normalize);
	}
}
