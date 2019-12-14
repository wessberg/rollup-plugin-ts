import {dirname, join, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../util/path/path-util";
import {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../util/chunk/get-chunk-to-original-file-map";
import {ChunkForModuleCache} from "../declaration-bundler-options";
import {getChunkFilename} from "./get-chunk-filename";
import {Resolver} from "../../../../util/resolve-id/resolver";

export interface GenerateModuleSpecifierOptions {
	moduleSpecifier: string;
	parent: string;
	absoluteChunkFileName: string;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	chunkForModuleCache: ChunkForModuleCache;
	resolver: Resolver;
}

export function generateModuleSpecifier({absoluteChunkFileName, moduleSpecifier, parent, ...options}: GenerateModuleSpecifierOptions) {
	const resolvedResult = options.resolver(moduleSpecifier, parent);

	// For external libraries, preserve the module specifier as it is
	if (resolvedResult != null && resolvedResult.isExternalLibrary) return moduleSpecifier;

	// Generate a module specifier that points to the referenced module, relative to the current sourcefile
	const absoluteModuleSpecifier = join(dirname(parent), moduleSpecifier);

	const otherChunkFileName = getChunkFilename({...options, fileName: absoluteModuleSpecifier});
	if (otherChunkFileName == null) return moduleSpecifier;

	const relativePath = relative(dirname(absoluteChunkFileName), otherChunkFileName);
	return ensureHasLeadingDotAndPosix(stripKnownExtension(relativePath), false);
}
