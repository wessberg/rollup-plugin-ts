import {OutputChunk} from "rollup";
import {normalize} from "path";
import {ModuleDependencyMap} from "../module/get-module-dependencies";

export interface MergedChunk {
	modules: string[];
	fileName: string;
	isEntry: boolean;
}

export interface MergeChunksWithAmbientDependenciesResult {
	mergedChunks: MergedChunk[];
	ambientModules: Set<string>;
}

export function mergeChunksWithAmbientDependencies(chunks: OutputChunk[], moduleDependencyMap: ModuleDependencyMap): MergeChunksWithAmbientDependenciesResult {
	const ambientModules = new Set<string>();
	const chunkLength = chunks.length;
	const mergedChunks: MergedChunk[] = Array(chunkLength);

	// First normalize the chunks
	for (let i = 0; i < chunkLength; i++) {
		const chunk = chunks[i];
		const modules = Object.keys(chunk.modules).map(normalize);
		mergedChunks[i] = {
			fileName: normalize(chunk.fileName),
			isEntry: chunk.isEntry,
			modules
		};
	}

	const allRollupChunkModules = new Set<string>();
	for (const chunk of mergedChunks)  {
		for (const module of chunk.modules) {
			allRollupChunkModules.add(module);
		}
	}

	for (const modules of moduleDependencyMap.values())  {
		for (const module of modules) {
			if (!allRollupChunkModules.has(module)) {
				ambientModules.add(module);
			}
		}
	}

	for (const [entry, moduleDependencies] of moduleDependencyMap.entries()) {
		// Find the chunk that contains the entry as a module
		const entryChunkIndex = mergedChunks.findIndex(chunk => chunk.modules.includes(entry));
		// If none of the chunks contains the entry, skip it
		if (entryChunkIndex < 0) continue;
		const entryChunk = mergedChunks[entryChunkIndex];

		// Otherwise, if any other chunk than the entry chunk contains any of the module dependencies, leave them out of the current chunk
		const filteredModuleDependencies = new Set(
			[...moduleDependencies].filter(dependency => !mergedChunks.some(chunk => chunk !== entryChunk && chunk.modules.includes(dependency)))
		);

		// Merge the modules with the ones that Rollup didn't catch
		const entryIndex = entryChunk.modules.indexOf(entry);
		if (entryIndex < 0) continue;

		let smallestIndex = entryIndex;

		// Other dependencies may already exist as part of the module and have lower indexes than the entry.
		// So, update the candidate if there is one with a smaller index
		for (const moduleDependency of filteredModuleDependencies) {
			const currentIndex = entryChunk.modules.indexOf(moduleDependency);
			if (currentIndex >= 0 && currentIndex < smallestIndex) {
				smallestIndex = currentIndex;
			}
		}

		const replacementElement = entryChunk.modules[smallestIndex];
		const replacedModules = entryChunk.modules.filter(
			module => module === replacementElement || (module !== entry && !filteredModuleDependencies.has(module))
		);

		const extraModules = [
			...filteredModuleDependencies,
			...(filteredModuleDependencies.has(entry) ? [] : [entry])
		];

		replacedModules.splice(
			replacedModules.indexOf(replacementElement),
			1,
			...extraModules
		);
		mergedChunks[entryChunkIndex].modules = replacedModules;
	}

	return {
		mergedChunks,
		ambientModules
	};
}
