import {SourceFileBundlerVisitorOptions, SourceFileToExportedSymbolSet} from "./transformers/source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../type/ts";
import {Resolver} from "../../../util/resolve-id/resolver";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../util/chunk/get-chunk-to-original-file-map";
import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "./transformers/reference/cache/reference-cache";
import {NodeIdentifierCache} from "./transformers/trace-identifiers/trace-identifiers";
import {PreparePathsResult} from "../../../declaration/emit-declarations";

export type ChunkForModuleCache = Map<string, string | undefined>;

export type DeclarationTransformer = (options: SourceFileBundlerVisitorOptions) => TS.SourceFile;

export interface ChunkOptions {
	paths: PreparePathsResult;
	modules: string[];
	entryModules: string[];
	isEntry: boolean;
}

export interface DeclarationBundlerOptions {
	typescript: typeof TS;
	typeChecker: TS.TypeChecker;
	chunk: ChunkOptions;
	declarationPaths: PreparePathsResult;
	declarationMapPaths: PreparePathsResult;

	// A cache map between nodes and the identifier names for them
	nodeIdentifierCache: NodeIdentifierCache;
	// A cache map between nodes and whether or not they are referenced
	referenceCache: ReferenceCache;

	// A cache between module names and the chunks that contain them
	chunkForModuleCache: ChunkForModuleCache;

	// A function that can resolve bare module specifiers
	resolver: Resolver;
	printer: TS.Printer;

	pluginOptions: TypescriptPluginOptions;

	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;

	sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;

	// Whether or not multiple chunks will be emitted
	isMultiChunk: boolean;
}
