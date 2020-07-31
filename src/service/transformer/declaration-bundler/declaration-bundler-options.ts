import {TS} from "../../../type/ts";
import {TypescriptPluginOptions} from "../../../plugin/typescript-plugin-options";
import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "./transformers/reference/cache/reference-cache";
import {SourceFileBundlerVisitorOptions} from "./transformers/source-file-bundler/source-file-bundler-visitor-options";
import {NormalizedChunk} from "../../../util/chunk/normalize-chunk";
import {CompilerHost} from "../../compiler-host/compiler-host";
import {PathsResult} from "./util/prepare-paths/prepare-paths";
import {SourceFileToExportedSymbolSet} from "./transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {SourceFileToImportedSymbolSet} from "./transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {TypeReference} from "./util/get-type-reference-module-from-file-name";
import {DeclarationStats} from "../../../type/declaration-stats";
import {ModuleDependency} from "../../../util/get-module-dependencies/get-module-dependencies";

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
