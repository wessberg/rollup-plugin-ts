import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../util/path/path-util";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface GenerateModuleSpecifierOptions extends SourceFileBundlerVisitorOptions {
	moduleSpecifier: string;
}

export function generateModuleSpecifier({chunk, moduleSpecifier, moduleSpecifierToSourceFileMap}: GenerateModuleSpecifierOptions) {
	const sourceFileWithChunk = moduleSpecifierToSourceFileMap.get(moduleSpecifier);

	// For external libraries, preserve the module specifier as it is
	if (sourceFileWithChunk == null || sourceFileWithChunk.chunk == null) {
		return moduleSpecifier;
	}

	const relativePath = relative(dirname(chunk.paths.absolute), sourceFileWithChunk.chunk);
	return ensureHasLeadingDotAndPosix(stripKnownExtension(relativePath), false);
}
