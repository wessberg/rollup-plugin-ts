import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";
import {resolveSourceFileFromModuleSpecifier} from "../../util/resolve-source-file-from-module-specifier";
import {mergeChunksWithAmbientDependencies} from "../../../../../util/chunk/merge-chunks-with-ambient-dependencies";
import {dirname, join} from "../../../../../util/path/path-util";
import {trackImportsTransformer} from "../track-imports-transformer/track-imports-transformer";
import {trackExportsTransformer} from "../track-exports-transformer/track-exports-transformer";

export interface GetModuleDependenciesOptions extends DeclarationBundlerOptions {
	module: string;
	sourceFiles: TS.SourceFile[];
	seenModules: Map<string, Set<string>>;
}

function getModuleDependencies(options: GetModuleDependenciesOptions): Set<string> {
	const {module, seenModules, moduleDependencyMap, sourceFileToImportedSymbolSet, sourceFileToExportedSymbolSet} = options;
	if (seenModules.has(module)) return seenModules.get(module)!;
	const dependencies = new Set<string>();
	seenModules.set(module, dependencies);

	moduleDependencyMap.set(module, dependencies);
	for (const crossReferenceSymbol of [...(sourceFileToExportedSymbolSet.get(module) ?? []), ...(sourceFileToImportedSymbolSet.get(module) ?? [])]) {
		if (crossReferenceSymbol.moduleSpecifier == null) continue;
		let resolved: {fileName: string} | undefined = resolveSourceFileFromModuleSpecifier({
			...options,
			moduleSpecifier: crossReferenceSymbol.moduleSpecifier,
			from: module
		});

		// If that wasn't possible, try to resolve the module relative to the current module
		if (resolved == null) {
			resolved = options.resolver(crossReferenceSymbol.moduleSpecifier, module);
		}

		if (resolved == null) continue;
		dependencies.add(resolved.fileName);
		getModuleDependencies({...options, module: resolved.fileName});
	}
	return dependencies;
}

export function initializeDeclarationBundlerOptions(options: DeclarationBundlerOptions, sourceFiles: TS.SourceFile[]): void {
	const seenModules = new Map<string, Set<string>>();
	sourceFiles.forEach(sourceFile => {
		for (const statement of sourceFile.statements) {
			if (options.typescript.isModuleDeclaration(statement)) {
				options.moduleSpecifierToSourceFileMap.set(statement.name.text, sourceFile);
			}
		}
	});

	for (const sourceFile of sourceFiles) {
		trackImportsTransformer({
			...options,
			sourceFile
		});
		trackExportsTransformer({
			...options,
			sourceFile
		});
	}

	for (const module of new Set([...options.sourceFileToImportedSymbolSet.keys(), ...options.sourceFileToExportedSymbolSet.keys()])) {
		getModuleDependencies({
			...options,
			sourceFiles,
			module,
			seenModules
		});
	}

	// Merge ambient dependencies into the chunks
	mergeChunksWithAmbientDependencies(options.chunks, options.moduleDependencyMap, options.languageServiceHost);
	const absoluteOutDir = dirname(options.chunk.paths.absolute);
	for (const chunk of options.chunks) {
		options.chunkToOriginalFileMap.set(join(absoluteOutDir, chunk.fileName), chunk.modules);
	}
}
