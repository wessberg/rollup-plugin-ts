import {TS} from "../../../type/ts";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";
import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "./transformers/reference/cache/reference-cache";
import {SourceFileBundlerVisitorOptions} from "./transformers/source-file-bundler/source-file-bundler-visitor-options";
import {NormalizedChunk} from "../../../util/chunk/normalize-chunk";
import {CompilerHost} from "../../compiler-host/compiler-host";
import {PathsResult} from "./util/prepare-paths/prepare-paths";
import {SourceFileToExportedSymbolSet} from "./transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {SourceFileToImportedSymbolSet} from "./transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {ExtendedResolvedModule} from "../../cache/resolve-cache/i-resolve-cache";

export type SourceFileToDependenciesMap = Map<string, Set<ExtendedResolvedModule>>;
export type ModuleSpecifierToSourceFileMap = Map<string, TS.SourceFile>;
export type DeclarationTransformer = (options: SourceFileBundlerVisitorOptions) => TS.SourceFile;

export interface DeclarationBundlerOptions {
	typescript: typeof TS;
	printer: TS.Printer;
	typeChecker: TS.TypeChecker;
	host: CompilerHost;
	chunk: NormalizedChunk;
	chunks: NormalizedChunk[];
	declarationPaths: PathsResult;
	declarationMapPaths: PathsResult;
	wrappedTransformers: TS.CustomTransformers | undefined;

	// A cache map between nodes and whether or not they are referenced
	referenceCache: ReferenceCache;
	pluginOptions: TypescriptPluginOptions;
	sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache;
	sourceFileToTypeReferencesSet: Map<string, Set<string>>;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
}
