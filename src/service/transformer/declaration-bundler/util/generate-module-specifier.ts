import {dirname, ensureHasLeadingDotAndPosix, relative, stripKnownExtension} from "../../../../util/path/path-util";
import {getChunkFilename, GetChunkFilenameOptions} from "./get-chunk-filename";
import {ChunkOptions} from "../declaration-bundler-options";
import {resolveSourceFileFromModuleSpecifier, ResolveSourceFileFromModuleSpecifierOptions} from "./resolve-source-file-from-module-specifier";

export interface GenerateModuleSpecifierOptions extends Omit<GetChunkFilenameOptions, "fileName">, ResolveSourceFileFromModuleSpecifierOptions {
	chunk: ChunkOptions;
}

export function generateModuleSpecifier(options: GenerateModuleSpecifierOptions): string | undefined {
	const {chunk, moduleSpecifier} = options;
	const sourceFileWithChunk = resolveSourceFileFromModuleSpecifier(options);

	if (sourceFileWithChunk == null) {
		return moduleSpecifier;
	}

	const chunkForModuleSpecifier = getChunkFilename({...options, fileName: sourceFileWithChunk.fileName});

	if (chunkForModuleSpecifier == null) {
		return moduleSpecifier;
	}

	// Never allow self-referencing chunks
	if (chunkForModuleSpecifier === chunk.paths.absolute) {
		return undefined;
	}

	const relativePath = relative(dirname(chunk.paths.absolute), chunkForModuleSpecifier);
	return ensureHasLeadingDotAndPosix(stripKnownExtension(relativePath), false);
}
