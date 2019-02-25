import {NormalizeModuleSpecifierOptions} from "./normalize-module-specifier-options";
import {ensureHasLeadingDot, isExternalLibrary, stripExtension} from "../../../../../util/path/path-util";
import {dirname, join, relative} from "path";
import {getChunkFilename} from "../get-chunk-filename/get-chunk-filename";
import {NormalizeModuleSpecifierResult} from "./normalize-module-specifier-result";

/**
 * Normalizes the given module specifier such that it references the correct chunk with the
 * correct chunk name.
 * @param {NormalizeModuleSpecifierOptions} options
 * @return {NormalizeModuleSpecifierResult}
 */
export function normalizeModuleSpecifier({
	absoluteOutFileName,
	relativeOutFileName,
	chunkToOriginalFileMap,
	sourceFile,
	specifier,
	supportedExtensions
}: NormalizeModuleSpecifierOptions): NormalizeModuleSpecifierResult {
	if (isExternalLibrary(specifier)) {
		return {
			hasChanged: false,
			isSameChunk: false,
			normalizedModuleSpecifier: specifier,
			normalizedAbsoluteModuleSpecifier: specifier
		};
	}

	// Compute an absolute path based on the text of the specifier and the current SourceFile
	const absoluteModuleSpecifierText = join(dirname(sourceFile.fileName), specifier);

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const normalizedAbsoluteModuleSpecifierText = getChunkFilename(absoluteModuleSpecifierText, supportedExtensions, chunkToOriginalFileMap);

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const normalizedModuleSpecifier = stripExtension(ensureHasLeadingDot(relative(dirname(absoluteOutFileName), normalizedAbsoluteModuleSpecifierText)));

	return {
		normalizedModuleSpecifier,
		normalizedAbsoluteModuleSpecifier: normalizedAbsoluteModuleSpecifierText,
		hasChanged: normalizedModuleSpecifier !== specifier,
		isSameChunk: normalizedModuleSpecifier === stripExtension(relativeOutFileName)
	};
}
