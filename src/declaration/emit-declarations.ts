import {OutputBundle, OutputOptions, PluginContext} from "rollup";
import {TypescriptPluginOptions} from "../plugin/i-typescript-plugin-options";
import {isOutputChunk} from "../util/is-output-chunk/is-output-chunk";
import {getDeclarationOutDir} from "../util/get-declaration-out-dir/get-declaration-out-dir";
import {getOutDir} from "../util/get-out-dir/get-out-dir";
import {basename, dirname, join, nativeNormalize, relative, setExtension} from "../util/path/path-util";
import {D_TS_EXTENSION, DECLARATION_MAP_EXTENSION, JS_EXTENSION} from "../constant/constant";
import {bundleDeclarationsForChunk} from "./bundle-declarations-for-chunk";
import {
	ReferenceCache,
	SourceFileToNodeToReferencedIdentifiersCache
} from "../service/transformer/declaration-bundler/transformers/reference/cache/reference-cache";
import {normalizeChunk, preNormalizeChunk} from "../util/chunk/normalize-chunk";
import {shouldDebugEmit, shouldDebugMetrics} from "../util/is-debug/should-debug";
import {logMetrics} from "../util/logging/log-metrics";
import {CompilerHost} from "../service/compiler-host/compiler-host";
import {mergeChunksWithAmbientDependencies} from "../util/chunk/merge-chunks-with-ambient-dependencies";
import {preparePaths} from "../service/transformer/declaration-bundler/util/prepare-paths/prepare-paths";
import {logEmit} from "../util/logging/log-emit";
import {TS} from "../type/ts";

export interface EmitDeclarationsOptions {
	originalCompilerOptions: TS.CompilerOptions;
	pluginContext: PluginContext;
	bundle: OutputBundle;
	host: CompilerHost;
	pluginOptions: TypescriptPluginOptions;
	outputOptions: OutputOptions;
	multiEntryFileNames: Set<string> | undefined;
}

export function emitDeclarations(options: EmitDeclarationsOptions) {
	const fullBenchmark = shouldDebugMetrics(options.pluginOptions.debug) ? logMetrics(`Emit declarations`) : undefined;

	const typescript = options.host.getTypescript();
	const cwd = options.host.getCwd();
	const relativeOutDir = getOutDir(cwd, options.outputOptions);

	const chunks = Object.values(options.bundle)
		.filter(isOutputChunk)
		.map(preNormalizeChunk);

	// Merge ambient dependencies into the chunks
	mergeChunksWithAmbientDependencies(chunks, options.host);
	// Normalize the chunks
	const normalizedChunks = chunks.map(chunk => normalizeChunk(chunk, {...options, relativeOutDir}));

	const relativeDeclarationOutDir = getDeclarationOutDir(cwd, options.originalCompilerOptions, options.outputOptions);
	const absoluteDeclarationOutDir = join(cwd, relativeDeclarationOutDir);

	const sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache = new Map();
	const referenceCache: ReferenceCache = new Map();

	let virtualOutFile = preparePaths({
		fileName: setExtension("index.js", D_TS_EXTENSION),
		relativeOutDir: relativeDeclarationOutDir,
		absoluteOutDir: absoluteDeclarationOutDir
	});

	// Rewrite the virtual out file if a hook is provided
	if (options.pluginOptions.hook.outputPath != null) {
		const result = options.pluginOptions.hook.outputPath(virtualOutFile.absolute, "declaration");

		if (result != null) {
			virtualOutFile = preparePaths({
				fileName: basename(result),
				relativeOutDir: relative(cwd, dirname(result)),
				absoluteOutDir: dirname(result)
			});
		}
	}

	const host = options.host.clone({
		...options.host.getCompilationSettings(),
		declaration: Boolean(options.originalCompilerOptions.declaration),
		declarationMap: Boolean(options.originalCompilerOptions.declarationMap),
		declarationDir: options.originalCompilerOptions.declarationDir,
		outFile: setExtension(virtualOutFile.relative, JS_EXTENSION),
		module: typescript.ModuleKind.System,
		emitDeclarationOnly: true
	});

	const typeChecker = host.getTypeChecker();

	const sharedOptions = {
		...options,
		chunks: normalizedChunks,
		host,
		typeChecker,
		typescript,
		referenceCache,
		sourceFileToNodeToReferencedIdentifiersCache,
		sourceFileToTypeReferencesSet: new Map(),
		sourceFileToExportedSymbolSet: new Map(),
		sourceFileToImportedSymbolSet: new Map(),
		sourceFileToDependenciesMap: new Map(),
		moduleSpecifierToSourceFileMap: new Map(),
		printer: host.getPrinter()
	};

	for (const chunk of normalizedChunks) {
		let declarationPaths = preparePaths({
			fileName: setExtension(chunk.paths.fileName, D_TS_EXTENSION),
			relativeOutDir: relativeDeclarationOutDir,
			absoluteOutDir: absoluteDeclarationOutDir
		});

		let declarationMapPaths = preparePaths({
			fileName: setExtension(chunk.paths.fileName, DECLARATION_MAP_EXTENSION),
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
					relativeOutDir: relative(cwd, dirname(declarationResult)),
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

		// Don't emit declarations when there is no compatible entry file
		if (chunk.entryModules.size < 1) continue;

		const bundleResult = bundleDeclarationsForChunk({
			...sharedOptions,
			chunk,
			declarationPaths,
			declarationMapPaths,
			wrappedTransformers: options.host.getCustomTransformers()
		});

		if (shouldDebugEmit(options.pluginOptions.debug, emitFileDeclarationFilename, bundleResult.code, "declaration")) {
			logEmit(emitFileDeclarationFilename, bundleResult.code);
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
				logEmit(emitFileDeclarationMapFilename, bundleResult.map.toString());
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
