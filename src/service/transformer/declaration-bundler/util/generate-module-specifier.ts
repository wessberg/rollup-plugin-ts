import {dirname, ensureHasLeadingDotAndPosix, relative, stripKnownExtension} from "../../../../util/path/path-util";
import {getChunkFilename} from "./get-chunk-filename";
import {NormalizedChunk} from "../../../../util/chunk/normalize-chunk";
import {SourceFileResolver} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface GenerateModuleSpecifierOptions {
	moduleSpecifier: string;
	from: string;
	resolveSourceFile: SourceFileResolver;
	chunk: NormalizedChunk;
	chunks: NormalizedChunk[];
}

export function generateModuleSpecifier(options: GenerateModuleSpecifierOptions): string | undefined {
	const {chunk, moduleSpecifier, resolveSourceFile, from} = options;
	const sourceFile = resolveSourceFile(moduleSpecifier, from);

	if (sourceFile == null) {
		return moduleSpecifier;
	}

	const chunkForModuleSpecifier = getChunkFilename(sourceFile.fileName, options.chunks);

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
