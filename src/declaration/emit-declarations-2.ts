import {Resolver} from "../util/resolve-id/resolver";
import {SupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {FileSystem} from "../util/file-system/file-system";
import {PluginContext, OutputBundle, OutputOptions} from "rollup";
import {TS} from "../type/ts";
import {normalize, join, dirname, relative, parse} from "path";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {TypescriptPluginOptions} from "../plugin/i-typescript-plugin-options";
import {ModuleDependencyMap} from "../util/module/get-module-dependencies";
import {isOutputChunk} from "../util/is-output-chunk/is-output-chunk";
import {getDeclarationOutDir} from "../util/get-declaration-out-dir/get-declaration-out-dir";
import {getOutDir} from "../util/get-out-dir/get-out-dir";
import {mergeChunksWithAmbientDependencies} from "../util/chunk/merge-chunks-with-ambient-dependencies";
import {getChunkToOriginalFileMap} from "../util/chunk/get-chunk-to-original-file-map";
import {ensurePosix, setExtension} from "../util/path/path-util";
import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION, ROLLUP_PLUGIN_MULTI_ENTRY} from "../constant/constant";
import {bundleDeclarationsForChunk} from "./bundle-declarations-for-chunk-2";
import {ChunkForModuleCache} from "../service/transformer/declaration-bundler/declaration-bundler-options";
import {
	ReferenceCache,
	SourceFileToNodeToReferencedIdentifiersCache
} from "../service/transformer/declaration-bundler/transformers/reference/cache/reference-cache";
import {NodeIdentifierCache} from "../service/transformer/declaration-bundler/transformers/trace-identifiers/trace-identifiers";

export interface EmitDeclarationsOptions {
	resolver: Resolver;
	supportedExtensions: SupportedExtensions;
	fileSystem: FileSystem;
	pluginContext: PluginContext;
	bundle: OutputBundle;
	cwd: string;
	compilerOptions: TS.CompilerOptions;
	languageServiceHost: IncrementalLanguageService;
	pluginOptions: TypescriptPluginOptions;
	outputOptions: OutputOptions;
	moduleDependencyMap: ModuleDependencyMap;
	multiEntryFileNames: Set<string> | undefined;
	canEmitForFile(id: string): boolean;
}

export function emitDeclarations(options: EmitDeclarationsOptions) {
	const {typescript} = options.pluginOptions;
	const chunks = Object.values(options.bundle).filter(isOutputChunk);

	const relativeDeclarationOutDir = normalize(getDeclarationOutDir(options.cwd, options.compilerOptions, options.outputOptions));
	const absoluteDeclarationOutDir = join(options.cwd, relativeDeclarationOutDir);
	const relativeOutDir = getOutDir(options.cwd, options.outputOptions);
	const absoluteOutDir = join(options.cwd, relativeOutDir);
	const generateMap = Boolean(options.compilerOptions.declarationMap);
	const mergeChunksResult = mergeChunksWithAmbientDependencies(chunks, options.moduleDependencyMap);
	const chunkToOriginalFileMap = getChunkToOriginalFileMap(absoluteOutDir, mergeChunksResult);
	const sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache = new Map();
	const nodeIdentifierCache: NodeIdentifierCache = new Map();
	const chunkForModuleCache: ChunkForModuleCache = new Map();
	const referenceCache: ReferenceCache = new Map();
	const printer = typescript.createPrinter({newLine: options.compilerOptions.newLine});

	const sharedOptions = {
		...options,
		typescript,
		chunkToOriginalFileMap,
		generateMap,
		nodeIdentifierCache,
		chunkForModuleCache,
		printer,
		referenceCache,
		sourceFileToNodeToReferencedIdentifiersCache,
		isMultiChunk: mergeChunksResult.mergedChunks.length > 1
	};

	for (const chunk of mergeChunksResult.mergedChunks) {
		// Prepare file names
		const relativeChunkFileName = normalize(chunk.fileName);
		const absoluteChunkFileName = join(absoluteOutDir, chunk.fileName);
		const declarationFilename = setExtension(chunk.fileName, DECLARATION_EXTENSION);
		const declarationMapFilename = setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION);
		const absoluteDeclarationFilename = join(absoluteDeclarationOutDir, declarationFilename);
		const absoluteDeclarationMapFilename = join(absoluteDeclarationOutDir, declarationMapFilename);
		const relativeDeclarationMapDirname = join(relativeDeclarationOutDir, dirname(declarationMapFilename));
		const absoluteDeclarationMapDirname = join(absoluteDeclarationOutDir, dirname(declarationMapFilename));

		const augmentedAbsoluteDeclarationFileName = options.pluginOptions.hook.outputPath?.(absoluteDeclarationFilename, "declaration");
		const rewrittenAbsoluteDeclarationFilename = augmentedAbsoluteDeclarationFileName ?? absoluteDeclarationFilename;
		const augmentedAbsoluteDeclarationMapFileName = generateMap
			? options.pluginOptions.hook.outputPath?.(absoluteDeclarationMapFilename, "declarationMap")
			: undefined;
		const rewrittenAbsoluteDeclarationMapFilename = augmentedAbsoluteDeclarationMapFileName ?? absoluteDeclarationMapFilename;
		const rewrittenDeclarationFilename =
			rewrittenAbsoluteDeclarationFilename === absoluteDeclarationFilename ? declarationFilename : parse(rewrittenAbsoluteDeclarationFilename).base;
		const rewrittenDeclarationMapFilename =
			rewrittenAbsoluteDeclarationMapFilename === absoluteDeclarationMapFilename
				? declarationMapFilename
				: parse(rewrittenAbsoluteDeclarationMapFilename).base;

		// We'll need to work with POSIX paths for now
		let emitFileDeclarationFilename = ensurePosix(join(relative(relativeOutDir, relativeDeclarationOutDir), rewrittenDeclarationFilename));
		let emitFileDeclarationMapFilename = ensurePosix(join(relative(relativeOutDir, relativeDeclarationOutDir), rewrittenDeclarationMapFilename));

		// Rollup does not allow emitting files outside of the root of the whatever 'dist' directory that has been provided.
		while (emitFileDeclarationFilename.startsWith("../") || emitFileDeclarationFilename.startsWith("..\\")) {
			emitFileDeclarationFilename = emitFileDeclarationFilename.slice("../".length);
		}
		while (emitFileDeclarationMapFilename.startsWith("../") || emitFileDeclarationMapFilename.startsWith("..\\")) {
			emitFileDeclarationMapFilename = emitFileDeclarationMapFilename.slice("../".length);
		}

		// Now, make sure to normalize the file names again
		emitFileDeclarationFilename = normalize(emitFileDeclarationFilename);
		emitFileDeclarationMapFilename = normalize(emitFileDeclarationMapFilename);

		const rawLocalModuleNames = chunk.modules;
		const modules = rawLocalModuleNames.filter(options.canEmitForFile);
		const rawEntryFileName = rawLocalModuleNames.slice(-1)[0];
		let entryModules = [modules.slice(-1)[0]];

		// If the entry filename is equal to the ROLLUP_PLUGIN_MULTI_ENTRY constant,
		// the entry is a combination of one or more of the local module names.
		// Luckily we should know this by now after having parsed the contents in the transform hook
		if (rawEntryFileName === ROLLUP_PLUGIN_MULTI_ENTRY && options.multiEntryFileNames != null) {
			// Reassign the entry file names accordingly
			entryModules = [...options.multiEntryFileNames];
		}

		// Don't emit declarations when there is no compatible entry file
		if (entryModules.length < 1 || entryModules.some(entryFileName => entryFileName == null)) continue;

		const bundleResult = bundleDeclarationsForChunk({
			...sharedOptions,
			isEntryChunk: chunk.isEntry,
			absoluteChunkFileName,
			absoluteDeclarationFilename,
			absoluteDeclarationMapFilename,
			augmentedAbsoluteDeclarationFileName,
			augmentedAbsoluteDeclarationMapFileName,
			declarationFilename,
			relativeDeclarationMapDirname,
			absoluteDeclarationMapDirname,
			declarationMapFilename,
			entryModules,
			modules,
			relativeChunkFileName,
			rewrittenAbsoluteDeclarationFilename,
			rewrittenAbsoluteDeclarationMapFilename,
			rewrittenDeclarationFilename,
			rewrittenDeclarationMapFilename
		});

		// Now, add the declarations as an asset
		options.pluginContext.emitFile({
			type: "asset",
			source: bundleResult.code,
			fileName: emitFileDeclarationFilename
		});

		// If there is a SourceMap for the declarations, add that asset too
		if (bundleResult.map != null) {
			options.pluginContext.emitFile({
				type: "asset",
				source: bundleResult.map.toString(),
				fileName: emitFileDeclarationMapFilename
			});
		}
		break;
	}
}
