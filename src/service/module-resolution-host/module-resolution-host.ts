import {getExtension, isBabelHelper, isBabelRegeneratorRuntime, isTslib} from "../../util/path/path-util";
import {IModuleResolutionHostOptions} from "./i-module-resolution-host-options";
import {TS} from "../../type/ts";

/**
 * A ModuleResolutionHost can resolve files
 */
export class ModuleResolutionHost implements TS.ModuleResolutionHost {
	constructor(private readonly options: IModuleResolutionHostOptions) {}

	/**
	 * Returns true if the given file exists
	 */
	fileExists(fileName: string): boolean {
		return (
			(isBabelHelper(fileName) || isBabelRegeneratorRuntime(fileName) || isTslib(fileName) || this.options.extensions.has(getExtension(fileName))) &&
			this.options.languageServiceHost.fileExists(fileName)
		);
	}

	/**
	 * Reads the given file
	 */
	readFile(fileName: string, encoding?: string): string | undefined {
		return this.options.languageServiceHost.readFile(fileName, encoding);
	}
}
