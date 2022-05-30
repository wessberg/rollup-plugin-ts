import {TS} from "../../../type/ts.js";
import {TypescriptPluginOptions} from "../../../plugin/typescript-plugin-options.js";
import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "./transformers/reference/cache/reference-cache.js";
import {SourceFileBundlerVisitorOptions} from "./transformers/source-file-bundler/source-file-bundler-visitor-options.js";
import {NormalizedChunk} from "../../../util/chunk/normalize-chunk.js";
import {CompilerHost} from "../../compiler-host/compiler-host.js";
import {PathsResult} from "./util/prepare-paths/prepare-paths.js";
import {SourceFileToExportedSymbolSet} from "./transformers/track-exports-transformer/track-exports-transformer-visitor-options.js";
import {SourceFileToImportedSymbolSet} from "./transformers/track-imports-transformer/track-imports-transformer-visitor-options.js";
import {TypeReference} from "./util/get-type-reference-module-from-file-name.js";
import {DeclarationStats} from "../../../type/declaration-stats.js";
import {ModuleDependency} from "../../../util/get-module-dependencies/get-module-dependencies.js";

export type SourceFileToDependenciesMap = Map<string, Set<ModuleDependency>>;
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
	sourceFileToTypeReferencesSet: Map<string, Set<TypeReference>>;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
	declarationStats: DeclarationStats | undefined;
}
