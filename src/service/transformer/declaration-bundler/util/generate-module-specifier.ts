import {dirname, ensureHasLeadingDotAndPosix, relative, stripKnownExtension} from "../../../../util/path/path-util";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface GenerateModuleSpecifierOptions extends SourceFileBundlerVisitorOptions {
	moduleSpecifier: string;
}

export function generateModuleSpecifier({
	chunk,
	moduleSpecifier,
	moduleSpecifierToSourceFileMap
}: GenerateModuleSpecifierOptions): string | undefined {
	const sourceFileWithChunk = moduleSpecifierToSourceFileMap.get(moduleSpecifier);

	// For external libraries, preserve the module specifier as it is
	if (sourceFileWithChunk == null || sourceFileWithChunk.chunk == null) {
		return moduleSpecifier;
	}

	// Never allow self-referencing chunks
	if (sourceFileWithChunk.chunk === chunk.paths.absolute) {
		return undefined;
	}

	const relativePath = relative(dirname(chunk.paths.absolute), sourceFileWithChunk.chunk);
	return ensureHasLeadingDotAndPosix(stripKnownExtension(relativePath), false);
}
