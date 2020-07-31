import {dirname, ensureHasLeadingDotAndPosix, normalize, relative, stripKnownExtension} from "../../../../util/path/path-util";
import {getChunkFilename} from "./get-chunk-filename";
import {NormalizedChunk} from "../../../../util/chunk/normalize-chunk";
import {SourceFileResolver} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {CompilerHost} from "../../../compiler-host/compiler-host";
import {pickResolvedModule} from "../../../../util/pick-resolved-module";
import {similarity} from "../../../../util/similarity-util";

export interface GenerateModuleSpecifierOptions {
	host: CompilerHost;
	moduleSpecifier: string;
	from: string;
	resolveSourceFile: SourceFileResolver;
	chunk: NormalizedChunk;
	chunks: NormalizedChunk[];
}

export function isSameChunk(options: GenerateModuleSpecifierOptions): boolean {
	return generateModuleSpecifier(options) == null;
}

export function generateModuleSpecifier(options: GenerateModuleSpecifierOptions): string | undefined {
	const {chunk, moduleSpecifier, resolveSourceFile, chunks, from, host} = options;
	const sourceFile = resolveSourceFile(moduleSpecifier, from);

	if (sourceFile == null) {
		return moduleSpecifier;
	}

	const chunkForModuleSpecifier = getChunkFilename(sourceFile.fileName, chunks);

	// If no chunk could be located for the module specifier, it most likely marked as external.
	// Leave it exactly as it is to mimic the behavior of Rollup. Unfortunately, this is not as
	// easy as it could be, given that all module specifiers are rewritten to bare module specifiers
	// when leveraging TypeScript's 'outFile' feature, so we'll have to get a hold of the original SourceFile
	// to see what the original module specifier might have been.
	if (chunkForModuleSpecifier == null) {
		const fromSourceFile = host.getSourceFile(from);
		if (fromSourceFile == null) {
			return moduleSpecifier;
		}
		const dependencies = host.getDependenciesForFile(fromSourceFile.fileName);

		if (dependencies == null) {
			return moduleSpecifier;
		}

		// Take the most similar-looking module specifier by Levenshtein distance
		return [...dependencies]
			.filter(dependency => normalize(pickResolvedModule(dependency, true)) === normalize(sourceFile.fileName))
			.map(dependency => [dependency.moduleSpecifier, similarity(moduleSpecifier, dependency.moduleSpecifier)] as [string, number])
			.sort(([, a], [, b]) => (a > b ? 1 : -1))
			.map(([specifier]) => specifier)[0];
	}

	// Never allow self-referencing chunks
	if (chunkForModuleSpecifier === chunk.paths.absolute) {
		return undefined;
	}

	const relativePath = relative(dirname(chunk.paths.absolute), chunkForModuleSpecifier);
	return ensureHasLeadingDotAndPosix(stripKnownExtension(relativePath), false);
}
