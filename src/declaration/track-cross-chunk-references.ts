import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {
	SourceFileToExportedSymbolSet,
	TrackExportsOptions
} from "../service/transformer/cross-chunk-reference-tracker/transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {SourceFileToImportedSymbolSet} from "../service/transformer/cross-chunk-reference-tracker/transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {NormalizedChunk} from "../util/chunk/normalize-chunk";

import {SupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {join} from "../util/path/path-util";
import {generateRandomHash} from "../util/hash/generate-random-hash";
import {crossChunkReferenceTracker} from "../service/transformer/cross-chunk-reference-tracker/cross-chunk-reference-tracker";
import {TypescriptPluginOptions} from "../plugin/i-typescript-plugin-options";
import {TS} from "../type/ts";
import {ModuleSpecifierToSourceFileMap} from "../service/transformer/declaration-bundler/declaration-bundler-options";

export type ModuleDependencyMap = Map<string, Set<string>>;

export interface TrackCrossChunkReferencesOptions extends Omit<TrackExportsOptions, "sourceFile" | "sourceFileToExportedSymbolSet"> {
	chunks: NormalizedChunk[];
	languageServiceHost: IncrementalLanguageService;
	supportedExtensions: SupportedExtensions;
	pluginOptions: TypescriptPluginOptions;
	printer: TS.Printer;
}

export interface TrackCrossChunkReferencesResult {
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	moduleDependencyMap: ModuleDependencyMap;
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
}

export interface GetModuleDependenciesOptions extends TrackCrossChunkReferencesOptions {
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
	moduleDependencyMap: ModuleDependencyMap;
	module: string;
	seenModules: Map<string, Set<string>>;
}

function getModuleDependencies(options: GetModuleDependenciesOptions): Set<string> {
	const {
		module,
		seenModules,
		moduleDependencyMap,
		sourceFileToImportedSymbolSet,
		sourceFileToExportedSymbolSet,
		moduleSpecifierToSourceFileMap
	} = options;
	if (seenModules.has(module)) return seenModules.get(module)!;
	const dependencies = new Set<string>();
	seenModules.set(module, dependencies);

	moduleDependencyMap.set(module, dependencies);
	for (const crossReferenceSymbol of [...(sourceFileToExportedSymbolSet.get(module) ?? []), ...(sourceFileToImportedSymbolSet.get(module) ?? [])]) {
		if (crossReferenceSymbol.moduleSpecifier == null) continue;
		let resolved: {fileName: string} | undefined = moduleSpecifierToSourceFileMap.get(crossReferenceSymbol.moduleSpecifier);

		// If that wasn't possible, try to resolve the module relative to the current module
		if (resolved == null) {
			resolved = options.resolver(crossReferenceSymbol.moduleSpecifier, module);
		}

		if (resolved == null) continue;
		dependencies.add(resolved.fileName);
		for (const deepDependency of getModuleDependencies({...options, module: resolved.fileName})) {
			dependencies.add(deepDependency);
		}
	}
	return dependencies;
}

export function trackCrossChunkReferences(options: TrackCrossChunkReferencesOptions): TrackCrossChunkReferencesResult {
	const sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet = new Map();
	const sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet = new Map();
	const moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap = new Map();
	const moduleDependencyMap: ModuleDependencyMap = new Map();
	const seenModules = new Map<string, Set<string>>();

	const {outDir, ...compilationSettings} = options.languageServiceHost.getCompilationSettings();
	const allModules = new Set<string>();

	for (const chunk of options.chunks) {
		for (const module of chunk.modules) {
			allModules.add(module);
		}
	}

	const program = options.typescript.createProgram({
		rootNames: [...allModules],
		options: {
			...compilationSettings,
			declarationMap: false,
			declaration: true,
			outFile: join(generateRandomHash(), "index.js"),
			module: options.typescript.ModuleKind.System,
			emitDeclarationOnly: true
		},
		host: options.languageServiceHost
	});

	program.emit(
		undefined,
		() => {},
		undefined,
		true,
		crossChunkReferenceTracker({
			...options,
			pluginOptions: {
				...options.pluginOptions,
				// Don't emit debug info for this phase
				debug: false
			},
			moduleSpecifierToSourceFileMap,
			sourceFileToExportedSymbolSet,
			sourceFileToImportedSymbolSet
		})
	);

	for (const module of new Set([...sourceFileToImportedSymbolSet.keys(), ...sourceFileToExportedSymbolSet.keys()])) {
		getModuleDependencies({
			...options,
			module,
			moduleDependencyMap,
			sourceFileToExportedSymbolSet,
			sourceFileToImportedSymbolSet,
			moduleSpecifierToSourceFileMap,
			seenModules
		});
	}

	return {
		sourceFileToImportedSymbolSet,
		sourceFileToExportedSymbolSet,
		moduleDependencyMap,
		moduleSpecifierToSourceFileMap
	};
}
