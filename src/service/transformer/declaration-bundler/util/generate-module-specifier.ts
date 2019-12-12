import {dirname, relative, join} from "path";
import {ensureHasLeadingDotAndPosix, isExternalLibrary, stripKnownExtension} from "../../../../util/path/path-util";
import {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../util/chunk/get-chunk-to-original-file-map";
import {ChunkForModuleCache} from "../declaration-bundler-options";
import {getChunkFilename} from "./get-chunk-filename";

export interface GenerateModuleSpecifierOptions {
	moduleSpecifier: string;
	parent: string;
	absoluteChunkFileName: string;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	chunkForModuleCache: ChunkForModuleCache;
}

export function generateModuleSpecifier({absoluteChunkFileName, moduleSpecifier, parent, ...options}: GenerateModuleSpecifierOptions) {
	// Generate a module specifier that points to the referenced module, relative to the current sourcefile
	if (isExternalLibrary(moduleSpecifier)) return moduleSpecifier;

	const absoluteModuleSpecifier = join(dirname(parent), moduleSpecifier);

	const otherChunkFileName = getChunkFilename({...options, fileName: absoluteModuleSpecifier});
	if (otherChunkFileName?.fileName == null) return moduleSpecifier;

	const relativePath = relative(dirname(absoluteChunkFileName), otherChunkFileName.fileName);
	return ensureHasLeadingDotAndPosix(stripKnownExtension(relativePath), false);
}
