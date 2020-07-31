import {ExternalOption, OutputBundle, OutputOptions, PluginContext} from "rollup";
import {TypescriptPluginOptions} from "../../../plugin/typescript-plugin-options";
import {isOutputChunk} from "../../../util/is-output-chunk/is-output-chunk";
import {getDeclarationOutDir} from "../../../util/get-declaration-out-dir/get-declaration-out-dir";
import {getOutDir} from "../../../util/get-out-dir/get-out-dir";
import {basename, dirname, join, nativeNormalize, relative, setExtension} from "../../../util/path/path-util";
import {D_TS_EXTENSION, D_TS_MAP_EXTENSION, JS_EXTENSION} from "../../../constant/constant";
import {bundleDeclarationsForChunk} from "./bundle-declarations-for-chunk";
import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "../../transformer/declaration-bundler/transformers/reference/cache/reference-cache";
import {normalizeChunk, preNormalizeChunk} from "../../../util/chunk/normalize-chunk";
import {shouldDebugEmit, shouldDebugMetrics} from "../../../util/is-debug/should-debug";
import {logMetrics} from "../../../util/logging/log-metrics";
import {CompilerHost} from "../../compiler-host/compiler-host";
import {mergeChunksWithAmbientDependencies} from "../../../util/chunk/merge-chunks-with-ambient-dependencies";
import {preparePaths} from "../../transformer/declaration-bundler/util/prepare-paths/prepare-paths";
import {logEmit} from "../../../util/logging/log-emit";
import {TS} from "../../../type/ts";
import {createFilter} from "@rollup/pluginutils";

export interface EmitDeclarationsOptions {
	pluginContext: PluginContext;
	bundle: OutputBundle;
	host: CompilerHost;
	pluginOptions: TypescriptPluginOptions;
	externalOption: ExternalOption | undefined;
	outputOptions: OutputOptions;
	multiEntryFileNames: Set<string> | undefined;
	originalCompilerOptions: TS.CompilerOptions;
}

export function emitDeclarations(options: EmitDeclarationsOptions): void {
	const fullBenchmark = shouldDebugMetrics(options.pluginOptions.debug) ? logMetrics(`Emit declarations`) : undefined;

	const typescript = options.host.getTypescript();
	const cwd = options.host.getCwd();
	const relativeOutDir = getOutDir(cwd, options.outputOptions);

	const chunks = Object.values(options.bundle).filter(isOutputChunk).map(preNormalizeChunk);

	// Merge ambient dependencies into the chunks
	mergeChunksWithAmbientDependencies({
		chunks,
		host: options.host,
		externalOption: options.externalOption,
		chunkFileNames: options.outputOptions.chunkFileNames,
		format: options.outputOptions.format
	});

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

	const filter = createFilter(undefined, [setExtension(virtualOutFile.relative, D_TS_EXTENSION), setExtension(virtualOutFile.relative, D_TS_MAP_EXTENSION)]);

	const host = options.host.clone(
		{
			...options.host.getCompilationSettings(),
			declaration: Boolean(options.originalCompilerOptions.declaration),
			declarationMap: Boolean(options.originalCompilerOptions.declarationMap),
			declarationDir: options.originalCompilerOptions.declarationDir,
			outFile: setExtension(virtualOutFile.relative, JS_EXTENSION),
			module: typescript.ModuleKind.System,
			emitDeclarationOnly: true,

			// Never allow these options for bundled declarations
			composite: false,
			incremental: false,
			tsBuildInfoFile: undefined
		},
		filter,
		{
			allowTransformingDeclarations: true
		}
	);

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
		printer: host.getPrinter(),
		// Only prepare the record if a hook has been provided
		declarationStats: options.pluginOptions.hook.declarationStats != null ? {} : undefined
	};

	for (const chunk of normalizedChunks) {
		let declarationPaths = preparePaths({
			fileName: setExtension(chunk.paths.fileName, D_TS_EXTENSION),
			relativeOutDir: relativeDeclarationOutDir,
			absoluteOutDir: absoluteDeclarationOutDir
		});

		let declarationMapPaths = preparePaths({
			fileName: setExtension(chunk.paths.fileName, D_TS_MAP_EXTENSION),
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

		const emitFileDeclarationFilename = relative(relativeOutDir, declarationPaths.relative);
		const emitFileDeclarationMapFilename = relative(relativeOutDir, declarationMapPaths.relative);

		// Rollup does not allow emitting files outside of the root of the whatever 'dist' directory that has been provided.
		// Under such circumstances, unfortunately, we'll have to default to using whatever FileSystem was provided to write the files to disk
		const declarationNeedsFileSystem = emitFileDeclarationFilename.startsWith("../") || emitFileDeclarationFilename.startsWith("..\\") || options.pluginContext.emitFile == null;
		const declarationMapNeedsFileSystem =
			emitFileDeclarationMapFilename.startsWith("../") || emitFileDeclarationMapFilename.startsWith("..\\") || options.pluginContext.emitFile == null;

		// Don't emit declarations when there is no compatible entry file
		if (chunk.entryModules.size < 1) continue;

		const bundleResult = bundleDeclarationsForChunk({
			...sharedOptions,
			chunk,
			declarationPaths,
			declarationMapPaths,
			wrappedTransformers: host.getCustomTransformers()
		});

		if (shouldDebugEmit(options.pluginOptions.debug, declarationPaths.absolute, bundleResult.code, "declaration")) {
			logEmit(declarationPaths.absolute, bundleResult.code);
		}

		if (declarationNeedsFileSystem) {
			options.host.getFileSystem().writeFile(nativeNormalize(declarationPaths.absolute), bundleResult.code);
		}

		// Otherwise, we can use Rollup, which is absolutely preferable
		else {
			options.pluginContext.emitFile({
				type: "asset",
				source: bundleResult.code,
				fileName: nativeNormalize(emitFileDeclarationFilename)
			});
		}

		// If there is a SourceMap for the declarations, add that asset too
		if (bundleResult.map != null) {
			if (shouldDebugEmit(options.pluginOptions.debug, declarationMapPaths.absolute, bundleResult.map.toString(), "declarationMap")) {
				logEmit(declarationMapPaths.absolute, bundleResult.map.toString());
			}

			if (declarationMapNeedsFileSystem) {
				options.host.getFileSystem().writeFile(nativeNormalize(declarationMapPaths.absolute), bundleResult.map.toString());
			}

			// Otherwise, we can use Rollup, which is absolutely preferable
			else {
				options.pluginContext.emitFile({
					type: "asset",
					source: bundleResult.map.toString(),
					fileName: nativeNormalize(emitFileDeclarationMapFilename)
				});
			}
		}
	}

	if (sharedOptions.declarationStats != null) {
		options.pluginOptions.hook.declarationStats?.(sharedOptions.declarationStats);
	}

	if (fullBenchmark != null) fullBenchmark.finish();
}
