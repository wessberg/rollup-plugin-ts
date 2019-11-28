import {Resolver} from "../../../util/resolve-id/resolver";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";
import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "../declaration-bundler/reference/cache/reference-cache";
import {NodeIdentifierCache} from "../declaration-bundler/util/get-identifiers-for-node";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";
import {
	SourceFileToExportedSymbolSet,
	SourceFileToImportedSymbolSet,
	SourceFileToLocalSymbolMap
} from "../declaration-pre-bundler/declaration-pre-bundler-options";
import {ChunkToOriginalFileMap} from "../../../util/chunk/get-chunk-to-original-file-map";
import {TS} from "../../../type/ts";

export interface GetChunkFilenameResult {
	fileName: string;
}

export type ChunkForModuleCache = Map<string, GetChunkFilenameResult | undefined>;

export interface DeclarationOptions {
	typescript: typeof TS;
	isEntryChunk: boolean;
	localModuleNames: string[];
	entryFileNames: string[];

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

	declarationFilename: string;
	rewrittenDeclarationFilename: string;
	declarationMapFilename: string;
	rewrittenDeclarationMapFilename: string;

	absoluteDeclarationFilename: string;
	augmentedAbsoluteDeclarationFileName: string | undefined;
	rewrittenAbsoluteDeclarationFilename: string;
	absoluteDeclarationMapFilename: string;
	augmentedAbsoluteDeclarationMapFileName: string | undefined;
	rewrittenAbsoluteDeclarationMapFilename: string;

	relativeDeclarationMapDirname: string;
	absoluteDeclarationMapDirname: string;

	// The absolute file path to the chunk this declaration file is related to
	relativeChunkFileName: string;

	// The absolute file path to the chunk this declaration file is related to
	absoluteChunkFileName: string;

	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap;
	sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache;

	// Whether or not multiple chunks will be emitted
	isMultiChunk: boolean;
}
