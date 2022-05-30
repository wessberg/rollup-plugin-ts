import {trackImportsTransformer} from "../track-imports-transformer/track-imports-transformer.js";
import {DeclarationChunkStats} from "../../../../../type/declaration-stats.js";
import {StatsCollectorOptions} from "./stats-collector-options.js";
import {ExtendedResolvedModule} from "../../../../cache/resolve-cache/extended-resolved-module.js";

export function statsCollector(options: StatsCollectorOptions): DeclarationChunkStats {
	const {typescript, sourceFile, declarationPaths, host, sourceFileToTypeReferencesSet} = options;

	const stats: DeclarationChunkStats = {
		externalTypes: []
	};

	// Track all imports
	const importedSymbols = trackImportsTransformer({
		sourceFile,
		typescript
	});

	const resolveResults: (ExtendedResolvedModule & {moduleSpecifier: string})[] = [];

	// For each of the Imported Symbols, resolve them using the provided ModuleResolutionHost
	for (const importedSymbol of importedSymbols) {
		const resolved = host.resolve(importedSymbol.moduleSpecifier, declarationPaths.absolute);
		if (resolved == null) continue;
		resolveResults.push({
			...resolved,
			moduleSpecifier: importedSymbol.moduleSpecifier
		});
	}

	for (const typeReference of sourceFileToTypeReferencesSet.get(sourceFile.fileName) ?? new Set()) {
		const resolved = host.resolve(typeReference.moduleSpecifier, declarationPaths.absolute);
		if (resolved == null) continue;
		resolveResults.push({
			...resolved,
			moduleSpecifier: typeReference.moduleSpecifier
		});
	}

	// For each resolveResult, check if they represent external dependencies, and if so, add them to the 'externalTypes' stats
	for (const resolveResult of resolveResults) {
		if (resolveResult.isExternalLibraryImport === true && resolveResult.packageId != null) {
			// If the external types already include this library, skip it
			if (stats.externalTypes.some(({library}) => library === resolveResult.packageId?.name)) continue;

			stats.externalTypes.push({
				library: resolveResult.packageId.name,
				version: resolveResult.packageId.version
			});
		}
	}

	return stats;
}
