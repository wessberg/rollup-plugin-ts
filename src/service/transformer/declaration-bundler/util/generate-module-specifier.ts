import {dirname, ensureHasLeadingDotAndPosix, relative, stripKnownExtension} from "../../../../util/path/path-util";
import {getChunkFilename, GetChunkFilenameOptions} from "./get-chunk-filename";
import {ChunkOptions, ModuleSpecifierToSourceFileMap} from "../declaration-bundler-options";

export interface GenerateModuleSpecifierOptions extends Omit<GetChunkFilenameOptions, "fileName"> {
	moduleSpecifier: string;
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
	chunk: ChunkOptions;
}

export function generateModuleSpecifier(options: GenerateModuleSpecifierOptions): string | undefined {
	const {chunk, moduleSpecifier, moduleSpecifierToSourceFileMap} = options;
	const sourceFileWithChunk = moduleSpecifierToSourceFileMap.get(moduleSpecifier);

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
