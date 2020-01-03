import {TS} from "../../type/ts";
import {ModuleResolutionHostOptions} from "./module-resolution-host-options";
import {nativeNormalize, normalize} from "../../util/path/path-util";
import {FileSystem} from "../../util/file-system/file-system";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";
import {VirtualFile, VirtualFileInput} from "./virtual-file";

export class ModuleResolutionHost implements TS.ModuleSpecifierResolutionHost {
	constructor(protected readonly options: ModuleResolutionHostOptions, protected readonly files: Map<string, VirtualFile> = new Map()) {}

	add(fileInput: VirtualFileInput | VirtualFile): VirtualFile {
		const file = {
			...fileInput,
			transformedText: "transformedText" in fileInput && fileInput.transformedText != null ? fileInput.transformedText : fileInput.text
		};
		this.files.set(file.fileName, file);
		return file;
	}

	delete(fileName: string): boolean {
		return this.files.delete(fileName);
	}

	has(fileName: string): boolean {
		return this.files.has(fileName);
	}

	get(fileName: string): VirtualFile | undefined {
		return this.files.get(fileName);
	}

	getFileNames(): Set<string> {
		return new Set(this.files.keys());
	}

	getRollupFileNames(): Set<string> {
		return new Set([...this.getFileNames()].filter(fileName => this.get(fileName)!.fromRollup));
	}

	getFileSystem(): FileSystem {
		return this.options.fileSystem;
	}

	getParsedCommandLine(): TS.ParsedCommandLine {
		return this.options.parsedCommandLine;
	}

	getCompilationSettings(): TS.CompilerOptions {
		return this.getParsedCommandLine().options;
	}

	getSupportedExtensions(): SupportedExtensions {
		return this.options.extensions;
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
		// Check if the file exists cached
		if (this.files.has(fileName)) return true;

		// Otherwise, check if it exists on disk
		return this.getFileSystem().fileExists(nativeNormalize(fileName));
	}

	/**
	 * Reads the given file
	 */
	readFile(fileName: string, encoding?: string): string | undefined {
		// Check if the file exists within the cached files and return it if so
		const result = this.files.get(fileName);
		if (result != null) return result.text;

		// Otherwise, try to properly resolve the file
		return this.getFileSystem().readFile(nativeNormalize(fileName), encoding);
	}

	/**
	 * Returns true if the given directory exists
	 */
	directoryExists(directoryName: string): boolean {
		return this.getFileSystem().directoryExists(nativeNormalize(directoryName));
	}

	/**
	 * Gets the real path for the given path. Meant to resolve symlinks
	 */
	realpath(path: string): string {
		return normalize(this.getFileSystem().realpath(nativeNormalize(path)));
	}

	/**
	 * Gets the current directory
	 */
	getCurrentDirectory(): string {
		return normalize(this.getCwd());
	}

	/**
	 * Gets all directories within the given directory path
	 */
	getDirectories(directoryName: string): string[] {
		return this.getFileSystem()
			.getDirectories(nativeNormalize(directoryName))
			.map(normalize);
	}
}
