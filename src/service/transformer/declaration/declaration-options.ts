import {Resolver} from "../../../util/resolve-id/resolver";
import {Printer} from "typescript";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";
import {ReferenceCache} from "../declaration-bundler/reference/cache/reference-cache";
import {NodeIdentifierCache} from "../declaration-bundler/util/get-identifiers-for-node";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";
import {SourceFileToExportedSymbolSet, SourceFileToGeneratedVariableNameSet, SourceFileToImportedSymbolSet, SourceFileToLocalSymbolMap} from "../declaration-pre-bundler/declaration-pre-bundler-options";
import {ChunkToOriginalFileMap} from "../../../util/chunk/get-chunk-to-original-file-map";

export interface DeclarationOptions {
	localModuleNames: string[];
	entryFileNames: string[];

	// A cache map between nodes and the identifier names for them
	nodeIdentifierCache: NodeIdentifierCache;
	// A cache map between nodes and whether or not they are referenced
	referenceCache: ReferenceCache;

	// A function that can resolve bare module specifiers
	resolver: Resolver;
	printer: Printer;

	pluginOptions: TypescriptPluginOptions;

	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;

	declarationFilename: string;
	rewrittenDeclarationFilename: string;
	declarationMapFilename: string;
	rewrittenDeclarationMapFilename: string;

	absoluteDeclarationFilename: string;
	augmentedAbsoluteDeclarationFileName: string|undefined;
	rewrittenAbsoluteDeclarationFilename: string;
	absoluteDeclarationMapFilename: string;
	augmentedAbsoluteDeclarationMapFileName: string|undefined;
	rewrittenAbsoluteDeclarationMapFilename: string;
	declarationMapDirname: string;

	// The absolute file path to the chunk this declaration file is related to
	relativeChunkFileName: string;

	// The absolute file path to the chunk this declaration file is related to
	absoluteChunkFileName: string;

	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap;
	sourceFileToGeneratedVariableNameSet: SourceFileToGeneratedVariableNameSet;
}