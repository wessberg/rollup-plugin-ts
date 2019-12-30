import {NormalizedChunk} from "./normalize-chunk";
import {ModuleDependencyMap} from "../../declaration/track-cross-chunk-references";
import {getChunkForModule} from "../../service/transformer/declaration-bundler/util/get-chunk-filename";
import {basename, stripKnownExtension} from "../path/path-util";
import {generateRandomHash} from "../hash/generate-random-hash";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";

export interface MergeChunksWithAmbientDependenciesResult {
	mergedChunks: NormalizedChunk[];
	ambientModules: Set<string>;
}

function createCommonChunk(module: string, code: string): NormalizedChunk {
	return {
		fileName: `${stripKnownExtension(basename(module))}-${generateRandomHash({key: code})}.js`,
		modules: [module],
		isEntry: false
	};
}

function ensureChunkForModule(module: string, code: string, chunks: NormalizedChunk[], moduleDependencyMap: ModuleDependencyMap): NormalizedChunk {
	let chunk = getChunkForModule(module, chunks);
	const [firstChunk] = chunks;

	if (chunk == null) {
		if (chunks.length === 1) {
			firstChunk.modules.unshift(module);
			return firstChunk;
		} else {
			// Find all modules that refer to this module.
			const referencingModules = [...moduleDependencyMap.entries()]
				.filter(([, dependencies]) => dependencies.has(module))
				.map(([otherModule]) => otherModule);
			// Find all chunks for the referencing modules
			const [firstReferencingChunk, ...otherReferencingChunks] = new Set(
				referencingModules.map(referencingModule => getChunkForModule(referencingModule, chunks)).filter(chunkOrUndefined => chunkOrUndefined != null)
			);

			// If only 1 chunk is matched, use that one
			if (firstReferencingChunk != null && otherReferencingChunks.length === 0) {
				firstReferencingChunk.modules.unshift(module);
				return firstReferencingChunk;
			}

			// Otherwise, create a new chunk
			else {
				chunk = createCommonChunk(module, code);
				chunks.push(chunk);
				return chunk;
			}
		}
	} else {
		return chunk;
	}
}

export function mergeChunksWithAmbientDependencies(
	chunks: NormalizedChunk[],
	moduleDependencyMap: ModuleDependencyMap,
	languageServiceHost: IncrementalLanguageService
): NormalizedChunk[] {
	const clonedChunks = JSON.parse(JSON.stringify(chunks)) as NormalizedChunk[];
	const dependencyToModulesMap: Map<string, Set<string>> = new Map();

	for (const [module, dependencies] of moduleDependencyMap.entries()) {
		for (const dependency of dependencies) {
			let modulesForDependency = dependencyToModulesMap.get(dependency);
			if (modulesForDependency == null) {
				modulesForDependency = new Set();
				dependencyToModulesMap.set(dependency, modulesForDependency);
			}
			modulesForDependency.add(module);
		}
	}

	for (const [dependency, modulesForDependency] of dependencyToModulesMap.entries()) {
		const chunkWithDependency = ensureChunkForModule(dependency, languageServiceHost.files.get(dependency)!.code, clonedChunks, moduleDependencyMap);

		const chunksForModulesForDependency = new Set<NormalizedChunk>(
			[...modulesForDependency].map(moduleForDependency =>
				ensureChunkForModule(moduleForDependency, languageServiceHost.getSourceFile(dependency)!.text, clonedChunks, moduleDependencyMap)
			)
		);

		// If the modules that refer to the dependency are divided across multiple chunks, and one of those chunks contain the dependency,
		// move it into its own chunk
		if (chunksForModulesForDependency.size > 1) {
			const containingChunk = [...chunksForModulesForDependency].find(chunkForModuleDependency => chunkForModuleDependency === chunkWithDependency);
			if (containingChunk != null) {
				containingChunk.modules.splice(containingChunk.modules.indexOf(dependency), 1);
				clonedChunks.push(createCommonChunk(dependency, languageServiceHost.getSourceFile(dependency)!.text));
			}
		}
	}
	return clonedChunks;
}
