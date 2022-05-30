import {OutputOptions} from "rollup";
import {ensureRelative} from "../path/path-util.js";
import path from "crosspath";
import {generateRandomHash} from "../hash/generate-random-hash.js";

/**
 * Gets the destination directory to use based on the given Rollup output options
 */
export function getOutDir(cwd: string, options?: Partial<OutputOptions>): string {
	let outDir: string | undefined;
	if (options == null) {
		// Generate a random output directory. The idea is that this will never match any existing files on disk.
		// The reason being that Typescript may erroneously think that input files may be overwritten if 'allowJs' is true
		// and 'outDir' is '.'
		outDir = path.join(cwd, generateRandomHash());
	} else if (options.dir != null) {
		outDir = options.dir;
	} else if (options.file != null) {
		outDir = path.dirname(options.file);
	} else {
		outDir = cwd;
	}

	// Return the relative output directory. Default to "." if it should be equal to cwd
	const relativeToCwd = ensureRelative(cwd, outDir);
	return relativeToCwd === "" ? "." : relativeToCwd;
}
