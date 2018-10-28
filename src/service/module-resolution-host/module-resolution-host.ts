import {ModuleResolutionHost as TSModuleResolutionHost} from "typescript";
import {getExtension} from "../../util/path/path-util";
import {IModuleResolutionHostOptions} from "./i-module-resolution-host-options";

/**
 * A ModuleResolutionHost can resolve files
 */
export class ModuleResolutionHost implements TSModuleResolutionHost {

	constructor (private readonly options: IModuleResolutionHostOptions) {
	}

	/**
	 * Returns true if the given file exists
	 * @param {string} fileName
	 * @returns {boolean}
	 */
	public fileExists (fileName: string): boolean {
		return this.options.extensions.includes(getExtension(fileName)) && this.options.languageServiceHost.fileExists(fileName);
	}

	/**
	 * Reads the given file
	 * @param {string} fileName
	 * @param {string} [encoding]
	 * @returns {string | undefined}
	 */
	public readFile (fileName: string, encoding?: string): string|undefined {
		return this.options.languageServiceHost.readFile(fileName, encoding);
	}
}