import {trackImportsTransformer} from "../track-imports-transformer/track-imports-transformer";
import {DeclarationStats} from "../../../../../type/declaration-stats";
import {StatsCollectorOptions} from "./stats-collector-options";
import {ExtendedResolvedModule} from "../../../../cache/resolve-cache/extended-resolved-module";

export function statsCollector(options: StatsCollectorOptions): DeclarationStats {
	const {typescript, sourceFile, declarationPaths, host, sourceFileToTypeReferencesSet} = options;

	const stats: DeclarationStats = {
		externalTypes: {}
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
			if (stats.externalTypes[declarationPaths.relative] == null) {
				stats.externalTypes[declarationPaths.relative] = [];
			}
			stats.externalTypes[declarationPaths.relative].push({
				library: resolveResult.packageId.name,
				version: resolveResult.packageId.version
			});
		}
	}

	return stats;
}
