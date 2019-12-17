import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {trackExportsTransformer} from "../service/transformer/declaration-bundler/transformers/track-exports-transformer/track-exports-transformer";
import {
	SourceFileToExportedSymbolSet,
	TrackExportsOptions
} from "../service/transformer/declaration-bundler/transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {SourceFileToImportedSymbolSet} from "../service/transformer/declaration-bundler/transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {trackImportsTransformer} from "../service/transformer/declaration-bundler/transformers/track-imports-transformer/track-imports-transformer";
import {NormalizedChunk} from "../util/chunk/normalize-chunk";
import {extname, normalize} from "path";
import {SupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";

export type ModuleDependencyMap = Map<string, Set<string>>;

export interface TrackCrossChunkReferencesOptions extends Omit<TrackExportsOptions, "sourceFile" | "sourceFileToExportedSymbolSet"> {
	chunks: NormalizedChunk[];
	languageServiceHost: IncrementalLanguageService;
	supportedExtensions: SupportedExtensions;
}

export interface HandleModuleOptions extends TrackCrossChunkReferencesOptions {
	module: string;
	seenModules: Set<string>;
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	moduleDependencyMap: ModuleDependencyMap;
}

export interface TrackCrossChunkReferencesResult {
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	moduleDependencyMap: ModuleDependencyMap;
}

function handleModule(options: HandleModuleOptions): void {
	const {seenModules, sourceFileToExportedSymbolSet, sourceFileToImportedSymbolSet, moduleDependencyMap, module} = options;
	if (seenModules.has(module)) return;
	seenModules.add(module);

	const sourceFile = options.languageServiceHost.getSourceFile(module);

	if (sourceFile != null) {
		let dependencies = moduleDependencyMap.get(sourceFile.fileName);
		if (dependencies == null) {
			dependencies = new Set();
			moduleDependencyMap.set(sourceFile.fileName, dependencies);
		}

		trackExportsTransformer({
			...options,
			sourceFileToExportedSymbolSet,
			sourceFile
		});

		trackImportsTransformer({
			...options,
			sourceFileToImportedSymbolSet,
			sourceFile
		});

		for (const exportedSymbol of [
			...sourceFileToExportedSymbolSet.get(sourceFile.fileName)!,
			...sourceFileToImportedSymbolSet.get(sourceFile.fileName)!
		]) {
			if (exportedSymbol.moduleSpecifier == null) continue;
			const resolved = options.resolver(exportedSymbol.moduleSpecifier, sourceFile.fileName);
			if (resolved == null) continue;

			const dependency = normalize(resolved.fileName);
			const code = options.languageServiceHost.readFile(dependency);
			if (code != null) {
				dependencies.add(dependency);

				if (options.supportedExtensions.has(extname(dependency))) {
					options.languageServiceHost.addFile({file: dependency, code});
					handleModule({...options, module: dependency});
				}
			}
		}
	}
}

export function trackCrossChunkReferences(options: TrackCrossChunkReferencesOptions): TrackCrossChunkReferencesResult {
	const sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet = new Map();
	const sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet = new Map();
	const moduleDependencyMap: ModuleDependencyMap = new Map();
	const seenModules = new Set<string>();

	for (const chunk of options.chunks) {
		for (const module of chunk.modules) {
			handleModule({
				...options,
				seenModules,
				module,
				sourceFileToExportedSymbolSet,
				sourceFileToImportedSymbolSet,
				moduleDependencyMap
			});
		}
	}
	return {
		sourceFileToImportedSymbolSet,
		sourceFileToExportedSymbolSet,
		moduleDependencyMap
	};
}
