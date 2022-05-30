import {OutputOptions} from "rollup";
import {ensureRelative} from "../path/path-util.js";
import {getOutDir} from "../get-out-dir/get-out-dir.js";
import {TS} from "../../type/ts.js";
import {
	AmbientExtension,
	CJSX_EXTENSION,
	CJS_EXTENSION,
	CTSX_EXTENSION,
	CTS_EXTENSION,
	D_CTS_EXTENSION,
	D_CTS_MAP_EXTENSION,
	D_MTS_EXTENSION,
	D_MTS_MAP_EXTENSION,
	D_TS_EXTENSION,
	D_TS_MAP_EXTENSION,
	MJSX_EXTENSION,
	MJS_EXTENSION,
	MTSX_EXTENSION,
	MTS_EXTENSION
} from "../../constant/constant.js";
import path from "crosspath";
import {NormalizedChunk} from "../chunk/normalize-chunk.js";

/**
 * Gets the destination directory to use for declarations based on the given CompilerOptions and Rollup output options
 */
export function getDeclarationOutDir(cwd: string, compilerOptions: TS.CompilerOptions, options?: Partial<OutputOptions>): string {
	const outDir = compilerOptions.declarationDir != null ? ensureRelative(cwd, compilerOptions.declarationDir) : getOutDir(cwd, options);

	// Default to "." if it should be equal to cwd
	return outDir === "" ? "." : outDir;
}

function selectDeclarationExtensionBasedOnFilename(filename: string, sourcemap = false): AmbientExtension {
	switch (path.extname(filename)) {
		case CTS_EXTENSION:
		case CTSX_EXTENSION:
		case CJS_EXTENSION:
		case CJSX_EXTENSION:
			return sourcemap ? D_CTS_MAP_EXTENSION : D_CTS_EXTENSION;
		case MTS_EXTENSION:
		case MTSX_EXTENSION:
		case MJS_EXTENSION:
		case MJSX_EXTENSION:
			return sourcemap ? D_MTS_MAP_EXTENSION : D_MTS_EXTENSION;
		default:
			return sourcemap ? D_TS_MAP_EXTENSION : D_TS_EXTENSION;
	}
}

/**
 * Gets the destination directory to use for declarations based on the given CompilerOptions and Rollup output options
 */
export function getDeclarationOutExtension(outputOptions: Partial<OutputOptions>, chunk?: NormalizedChunk, sourcemap = false): string {
	if (outputOptions.file != null) {
		return selectDeclarationExtensionBasedOnFilename(outputOptions.file, sourcemap);
	} else if (chunk != null) {
		return selectDeclarationExtensionBasedOnFilename(chunk.paths.fileName, sourcemap);
	} else {
		if (typeof outputOptions.entryFileNames === "string") {
			return selectDeclarationExtensionBasedOnFilename(outputOptions.entryFileNames, sourcemap);
		} else if (typeof outputOptions.chunkFileNames === "string") {
			return selectDeclarationExtensionBasedOnFilename(outputOptions.chunkFileNames, sourcemap);
		} else {
			return selectDeclarationExtensionBasedOnFilename(`index.js`, sourcemap);
		}
	}
}
