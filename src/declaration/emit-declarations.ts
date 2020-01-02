import {Resolver} from "../util/resolve-id/resolver";
import {SupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {FileSystem} from "../util/file-system/file-system";
import {OutputBundle, OutputOptions, PluginContext} from "rollup";
import {TS} from "../type/ts";

import {LanguageServiceHost} from "../service/language-service/language-service-host";
import {TypescriptPluginOptions} from "../plugin/i-typescript-plugin-options";
import {isOutputChunk} from "../util/is-output-chunk/is-output-chunk";
import {getDeclarationOutDir} from "../util/get-declaration-out-dir/get-declaration-out-dir";
import {getOutDir} from "../util/get-out-dir/get-out-dir";
import {basename, dirname, join, nativeNormalize, normalize, relative, setExtension} from "../util/path/path-util";
import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION, JS_EXTENSION, ROLLUP_PLUGIN_MULTI_ENTRY} from "../constant/constant";
import {bundleDeclarationsForChunk} from "./bundle-declarations-for-chunk";
import {
	ReferenceCache,
	SourceFileToNodeToReferencedIdentifiersCache
} from "../service/transformer/declaration-bundler/transformers/reference/cache/reference-cache";
import {NodeIdentifierCache} from "../service/transformer/declaration-bundler/transformers/trace-identifiers/trace-identifiers";
import {normalizeChunk} from "../util/chunk/normalize-chunk";
import {shouldDebugEmit, shouldDebugMetrics} from "../util/is-debug/should-debug";
import {IEmitCache} from "../service/cache/emit-cache/i-emit-cache";
import {benchmark} from "../util/benchmark/benchmark-util";

export interface EmitDeclarationsOptions {
	resolver: Resolver;
	emitCache: IEmitCache;
	supportedExtensions: SupportedExtensions;
	fileSystem: FileSystem;
	pluginContext: PluginContext;
	bundle: OutputBundle;
	cwd: string;
	compilerOptions: TS.CompilerOptions;
	languageServiceHost: LanguageServiceHost;
	languageService: TS.LanguageService;
	pluginOptions: TypescriptPluginOptions;
	outputOptions: OutputOptions;
	multiEntryFileNames: Set<string> | undefined;
	canEmitForFile(id: string): boolean;
}

export interface PreparePathsOptions {
	fileName: string;
	relativeOutDir: string;
	absoluteOutDir: string;
}

export interface PreparePathsResult {
	fileName: string;
	relative: string;
	absolute: string;
}

function preparePaths({relativeOutDir, absoluteOutDir, fileName}: PreparePathsOptions): PreparePathsResult {
	const absolutePath = join(absoluteOutDir, fileName);
	const relativePath = join(relativeOutDir, fileName);

	return {
		fileName,
		absolute: absolutePath,
		relative: relativePath
	};
}

export function emitDeclarations(options: EmitDeclarationsOptions) {
	const fullBenchmark = shouldDebugMetrics(options.pluginOptions.debug) ? benchmark(`Emit declarations`) : undefined;

	const {typescript} = options.pluginOptions;
	const chunks = Object.values(options.bundle)
		.filter(isOutputChunk)
		.map(normalizeChunk);

	const relativeDeclarationOutDir = getDeclarationOutDir(options.cwd, options.compilerOptions, options.outputOptions);
	const absoluteDeclarationOutDir = join(options.cwd, relativeDeclarationOutDir);

	const relativeOutDir = getOutDir(options.cwd, options.outputOptions);
	const generateMap = Boolean(options.compilerOptions.declarationMap);
	const sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache = new Map();
	const nodeIdentifierCache: NodeIdentifierCache = new Map();
	const referenceCache: ReferenceCache = new Map();
	const printer = typescript.createPrinter({newLine: options.compilerOptions.newLine});

	let virtualOutFile = preparePaths({
		fileName: setExtension("index.js", DECLARATION_EXTENSION),
		relativeOutDir: relativeDeclarationOutDir,
		absoluteOutDir: absoluteDeclarationOutDir
	});

	// Rewrite the virtual out file if a hook is provided
	if (options.pluginOptions.hook.outputPath != null) {
		const result = options.pluginOptions.hook.outputPath(virtualOutFile.absolute, "declaration");

		if (result != null) {
			virtualOutFile = preparePaths({
				fileName: basename(result),
				relativeOutDir: relative(options.cwd, dirname(result)),
				absoluteOutDir: dirname(result)
			});
		}
	}

	const mergedChunks = [...chunks];
	const allModules = new Set<string>();

	for (const chunk of mergedChunks) {
		for (const module of chunk.modules) {
			allModules.add(module);
		}
	}

	const program = typescript.createProgram({
		rootNames: [...allModules],
		options: {
			...options.compilerOptions,
			outFile: setExtension(virtualOutFile.relative, JS_EXTENSION),
			module: typescript.ModuleKind.System,
			emitDeclarationOnly: true
		},
		host: options.languageServiceHost,
		oldProgram: options.languageServiceHost.program
	});

	const typeChecker = program.getTypeChecker();

	const sharedOptions = {
		...options,
		program,
		typeChecker,
		typescript,
		generateMap,
		nodeIdentifierCache,
		printer,
		referenceCache,
		sourceFileToNodeToReferencedIdentifiersCache,
		chunks: mergedChunks,
		typeRoots: options.languageServiceHost.getTypeRoots(),
		sourceFileToTypeReferencesSet: new Map(),
		moduleSpecifierToSourceFileMap: new Map(),
		chunkToOriginalFileMap: new Map(),
		sourceFileToImportedSymbolSet: new Map(),
		sourceFileToExportedSymbolSet: new Map(),
		moduleDependencyMap: new Map()
	};

	for (const chunk of mergedChunks) {
		const chunkPaths = preparePaths({
			fileName: normalize(chunk.fileName),
			relativeOutDir: getOutDir(options.cwd, options.outputOptions),
			absoluteOutDir: join(options.cwd, relativeOutDir)
		});

		let declarationPaths = preparePaths({
			fileName: setExtension(chunk.fileName, DECLARATION_EXTENSION),
			relativeOutDir: relativeDeclarationOutDir,
			absoluteOutDir: absoluteDeclarationOutDir
		});

		let declarationMapPaths = preparePaths({
			fileName: setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION),
			relativeOutDir: relativeDeclarationOutDir,
			absoluteOutDir: absoluteDeclarationOutDir
		});

		// Rewrite the declaration paths
		if (options.pluginOptions.hook.outputPath != null) {
			const declarationResult = options.pluginOptions.hook.outputPath(declarationPaths.absolute, "declaration");
			const declarationMapResult = options.pluginOptions.hook.outputPath(declarationMapPaths.absolute, "declarationMap");

			if (declarationResult != null) {
				declarationPaths = preparePaths({
					fileName: basename(declarationResult),
					relativeOutDir: relative(options.cwd, dirname(declarationResult)),
					absoluteOutDir: dirname(declarationResult)
				});
			}

			if (declarationMapResult != null) {
				declarationMapPaths = {
					// Don't allow diverging from the declaration paths.
					// The two files must be placed together
					fileName: basename(declarationMapResult),
					relative: join(dirname(declarationPaths.relative), basename(declarationMapResult)),
					absolute: join(dirname(declarationPaths.absolute), basename(declarationMapResult))
				};
			}
		}

		let emitFileDeclarationFilename = join(relative(relativeOutDir, dirname(declarationPaths.relative)), declarationPaths.fileName);
		let emitFileDeclarationMapFilename = join(relative(relativeOutDir, dirname(declarationMapPaths.relative)), declarationMapPaths.fileName);

		// Rollup does not allow emitting files outside of the root of the whatever 'dist' directory that has been provided.
		while (emitFileDeclarationFilename.startsWith("../") || emitFileDeclarationFilename.startsWith("..\\")) {
			emitFileDeclarationFilename = emitFileDeclarationFilename.slice("../".length);
		}
		while (emitFileDeclarationMapFilename.startsWith("../") || emitFileDeclarationMapFilename.startsWith("..\\")) {
			emitFileDeclarationMapFilename = emitFileDeclarationMapFilename.slice("../".length);
		}

		// Convert the filenames to names that respects the OS-specific filename conventing (POSIX or Windows-style)
		emitFileDeclarationFilename = nativeNormalize(emitFileDeclarationFilename);
		emitFileDeclarationMapFilename = nativeNormalize(emitFileDeclarationMapFilename);

		const rawLocalModuleNames = chunk.modules;
		const modules = rawLocalModuleNames.filter(options.canEmitForFile);
		const rawEntryFileName = rawLocalModuleNames.slice(-1)[0];
		let entryModules = chunk.isEntry ? [modules.slice(-1)[0]] : [...modules].reverse();

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
			chunk: {
				paths: chunkPaths,
				isEntry: chunk.isEntry,
				modules: new Set(modules),
				entryModules: new Set(entryModules)
			},
			declarationPaths,
			declarationMapPaths
		});

		if (shouldDebugEmit(options.pluginOptions.debug, emitFileDeclarationFilename, bundleResult.code, "declaration")) {
			console.log(`=== Emitting ${emitFileDeclarationFilename} ===`);
			console.log(bundleResult.code);
		}

		if (options.pluginContext.emitFile == null) {
			throw new RangeError(`The installed version of Rollup is unsupported. You need to use v1.27.14 or newer to support this plugin`);
		}

		// Now, add the declarations as an asset
		options.pluginContext.emitFile({
			type: "asset",
			source: bundleResult.code,
			fileName: emitFileDeclarationFilename
		});

		// If there is a SourceMap for the declarations, add that asset too
		if (bundleResult.map != null) {
			if (shouldDebugEmit(options.pluginOptions.debug, emitFileDeclarationMapFilename, bundleResult.map.toString(), "declarationMap")) {
				console.log(`=== Emitting ${emitFileDeclarationMapFilename} ===`);
				console.log(bundleResult.map);
			}

			options.pluginContext.emitFile({
				type: "asset",
				source: bundleResult.map.toString(),
				fileName: emitFileDeclarationMapFilename
			});
		}
	}

	if (fullBenchmark != null) fullBenchmark.finish();
}
