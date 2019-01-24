import {OutputOptions} from "rollup";
import {ensureRelative} from "../path/path-util";
import {CompilerOptions} from "typescript";
import {getOutDir} from "../get-out-dir/get-out-dir";

/**
 * Gets the destination directory to use for declarations based on the given CompilerOptions and Rollup output options
 * @param {string} cwd
 * @param {CompilerOptions} compilerOptions
 * @param {Partial<OutputOptions>} [options]
 * @returns {string?}
 */
export function getDeclarationOutDir(cwd: string, compilerOptions: CompilerOptions, options?: Partial<OutputOptions>): string {
	const outDir = compilerOptions.declarationDir != null ? ensureRelative(cwd, compilerOptions.declarationDir) : getOutDir(cwd, options);

	// Default to "." if it should be equal to cwd
	return outDir === "" ? "." : outDir;
}
