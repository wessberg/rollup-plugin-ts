import {OutputOptions} from "rollup";
import {ensureRelative} from "../path/path-util";
import {getOutDir} from "../get-out-dir/get-out-dir";
import {TS} from "../../type/ts";

/**
 * Gets the destination directory to use for declarations based on the given CompilerOptions and Rollup output options
 */
export function getDeclarationOutDir(cwd: string, compilerOptions: TS.CompilerOptions, options?: Partial<OutputOptions>): string {
	const outDir = compilerOptions.declarationDir != null ? ensureRelative(cwd, compilerOptions.declarationDir) : getOutDir(cwd, options);

	// Default to "." if it should be equal to cwd
	return outDir === "" ? "." : outDir;
}
