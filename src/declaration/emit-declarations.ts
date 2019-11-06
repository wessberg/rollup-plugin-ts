import {isOutputChunk} from "../util/is-output-chunk/is-output-chunk";
import {dirname, join, normalize, parse} from "path";
import {getDeclarationOutDir} from "../util/get-declaration-out-dir/get-declaration-out-dir";
import {getOutDir} from "../util/get-out-dir/get-out-dir";
import {mergeChunksWithAmbientDependencies} from "../util/chunk/merge-chunks-with-ambient-dependencies";
import {getChunkToOriginalFileMap} from "../util/chunk/get-chunk-to-original-file-map";
import {SourceFileToExportedSymbolSet, SourceFileToGeneratedVariableNameSet, SourceFileToImportedSymbolSet, SourceFileToLocalSymbolMap} from "../service/transformer/declaration-pre-bundler/declaration-pre-bundler-options";
import {NodeIdentifierCache} from "../service/transformer/declaration-bundler/util/get-identifiers-for-node";
import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "../service/transformer/declaration-bundler/reference/cache/reference-cache";
import {CompilerOptions, createPrinter} from "typescript";
import {OutputBundle, OutputOptions, PluginContext, SourceDescription} from "rollup";
import {ModuleDependencyMap} from "../util/module/get-module-dependencies";
import {setExtension} from "../util/path/path-util";
import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION, ROLLUP_PLUGIN_MULTI_ENTRY} from "../constant/constant";
import {TypescriptPluginOptions} from "../plugin/i-typescript-plugin-options";
import {Resolver} from "../util/resolve-id/resolver";
import {SupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {preBundleDeclarationsForChunk, PreBundleDeclarationsForChunkOptions} from "./pre-bundle-declarations-for-chunk";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {bundleDeclarationsForChunk} from "./bundle-declarations-for-chunk";
import {ensureDefined} from "../util/assert-defined/assert-defined";
import {FileSystem} from "../util/file-system/file-system";
import {ChunkForModuleCache} from "../service/transformer/declaration/declaration-options";

export interface EmitDeclarationsOptions {
	resolver: Resolver;
	supportedExtensions: SupportedExtensions;
	fileSystem: FileSystem;
	pluginContext: PluginContext;
	bundle: OutputBundle;
	cwd: string;
	compilerOptions: CompilerOptions;
	languageServiceHost: IncrementalLanguageService;
	pluginOptions: TypescriptPluginOptions;
	outputOptions: OutputOptions;
	moduleDependencyMap: ModuleDependencyMap;
	multiEntryFileNames: Set<string>|undefined;
	canEmitForFile (id: string): boolean;
}

export function emitDeclarations (options: EmitDeclarationsOptions) {
	const chunkToPreBundleResult = new Map<string, SourceDescription>();
	const chunks = Object.values(options.bundle).filter(isOutputChunk);

	const declarationOutDir = join(options.cwd, getDeclarationOutDir(options.cwd, options.compilerOptions, options.outputOptions));
	const outDir = join(options.cwd, getOutDir(options.cwd, options.outputOptions));
	const generateMap = Boolean(options.compilerOptions.declarationMap);
	const mergeChunksResult = mergeChunksWithAmbientDependencies(chunks, options.moduleDependencyMap);
	const chunkToOriginalFileMap = getChunkToOriginalFileMap(outDir, mergeChunksResult);
	const sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet = new Map();
	const sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet = new Map();
	const sourceFileToGeneratedVariableNameSet: SourceFileToGeneratedVariableNameSet = new Map();
	const sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap = new Map();
	const sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache = new Map();
	const nodeIdentifierCache: NodeIdentifierCache = new Map();
	const chunkForModuleCache: ChunkForModuleCache = new Map();
	const referenceCache: ReferenceCache = new Map();
	const printer = createPrinter({newLine: options.compilerOptions.newLine});

	const sharedOptions = {
		...options,
		chunkToOriginalFileMap,
		generateMap,
		nodeIdentifierCache,
		chunkForModuleCache,
		printer,
		referenceCache,
		sourceFileToExportedSymbolSet,
		sourceFileToImportedSymbolSet,
		sourceFileToGeneratedVariableNameSet,
		sourceFileToLocalSymbolMap,
		sourceFileToNodeToReferencedIdentifiersCache,
		isMultiChunk: mergeChunksResult.mergedChunks.length > 1
	};

	for (const pass of [1, 2] as const) {
		for (const chunk of mergeChunksResult.mergedChunks) {
			// Prepare file names
			const relativeChunkFileName = normalize(chunk.fileName);
			const absoluteChunkFileName = join(outDir, chunk.fileName);
			const declarationFilename = setExtension(chunk.fileName, DECLARATION_EXTENSION);
			const declarationMapFilename = setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION);

			const absoluteDeclarationFilename = join(declarationOutDir, declarationFilename);
			const absoluteDeclarationMapFilename = join(declarationOutDir, declarationMapFilename);
			const declarationMapDirname = join(declarationOutDir, dirname(declarationMapFilename));

			const augmentedAbsoluteDeclarationFileName = options.pluginOptions.hook.outputPath?.(absoluteDeclarationFilename, "declaration");
			const rewrittenAbsoluteDeclarationFilename = augmentedAbsoluteDeclarationFileName ?? absoluteDeclarationFilename;
			const augmentedAbsoluteDeclarationMapFileName = generateMap ? options.pluginOptions.hook.outputPath?.(absoluteDeclarationMapFilename, "declarationMap") : undefined;
			const rewrittenAbsoluteDeclarationMapFilename = augmentedAbsoluteDeclarationMapFileName ?? absoluteDeclarationMapFilename;
			const rewrittenDeclarationFilename =
				rewrittenAbsoluteDeclarationFilename === absoluteDeclarationFilename ? declarationFilename : parse(rewrittenAbsoluteDeclarationFilename).base;
			const rewrittenDeclarationMapFilename =
				rewrittenAbsoluteDeclarationMapFilename === absoluteDeclarationMapFilename
					? declarationMapFilename
					: parse(rewrittenAbsoluteDeclarationMapFilename).base;

			const rawLocalModuleNames = chunk.modules;
			const localModuleNames = rawLocalModuleNames.filter(options.canEmitForFile);
			const rawEntryFileName = rawLocalModuleNames.slice(-1)[0];
			let entryFileNames = [localModuleNames.slice(-1)[0]];

			// If the entry filename is equal to the ROLLUP_PLUGIN_MULTI_ENTRY constant,
			// the entry is a combination of one or more of the local module names.
			// Luckily we should know this by now after having parsed the contents in the transform hook
			if (rawEntryFileName === ROLLUP_PLUGIN_MULTI_ENTRY && options.multiEntryFileNames != null) {
				// Reassign the entry file names accordingly
				entryFileNames = [...options.multiEntryFileNames];
			}

			// Don't emit declarations when there is no compatible entry file
			if (entryFileNames.length < 1 || entryFileNames.some(entryFileName => entryFileName == null)) continue;

			const baseOptions: PreBundleDeclarationsForChunkOptions = {
				...sharedOptions,
				isEntryChunk: chunk.isEntry,
				absoluteChunkFileName,
				absoluteDeclarationFilename,
				absoluteDeclarationMapFilename,
				augmentedAbsoluteDeclarationFileName,
				augmentedAbsoluteDeclarationMapFileName,
				declarationFilename,
				declarationMapDirname,
				declarationMapFilename,
				entryFileNames,
				localModuleNames,
				relativeChunkFileName,
				rewrittenAbsoluteDeclarationFilename,
				rewrittenAbsoluteDeclarationMapFilename,
				rewrittenDeclarationFilename,
				rewrittenDeclarationMapFilename,

				generateUniqueVariableName: (candidate: string, sourceFileName: string): string => {
					const suffix = "_$";
					let counter = 0;
					let generatedVariableNames = sourceFileToGeneratedVariableNameSet.get(sourceFileName);
					if (generatedVariableNames == null) {
						generatedVariableNames = new Set();
						sourceFileToGeneratedVariableNameSet.set(sourceFileName, generatedVariableNames);
					}

					while (true) {
						let currentCandidate = candidate + suffix + counter;
						if (generatedVariableNames.has(currentCandidate)) {
							counter++;
						} else {
							generatedVariableNames.add(currentCandidate);
							return currentCandidate;
						}
					}
				}
			};

			switch (pass) {
				case 1:
					chunkToPreBundleResult.set(
						absoluteChunkFileName,
						preBundleDeclarationsForChunk(baseOptions)
					);
					break;
				case 2: {
					const bundleResult = bundleDeclarationsForChunk({
						...baseOptions,
						preBundleResult: ensureDefined(
							chunkToPreBundleResult.get(absoluteChunkFileName),
							` Expected a prebundle result to present for chunk: '${absoluteChunkFileName}'`
						)
					});

					// Now, write the declarations to disk
					options.fileSystem.writeFileSync(absoluteDeclarationFilename, bundleResult.code);

					// If there is a SourceMap for the declarations, write them to disk too
					if (bundleResult.map != null) {
						options.fileSystem.writeFileSync(absoluteDeclarationMapFilename, bundleResult.map.toString());
					}
					break;
				}
			}
		}
	}
}