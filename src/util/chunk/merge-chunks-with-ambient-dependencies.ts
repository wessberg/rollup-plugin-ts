import {NormalizedChunk} from "./normalize-chunk";
import {ModuleDependencyMap} from "../../declaration/track-cross-chunk-references";

export interface MergeChunksWithAmbientDependenciesResult {
	mergedChunks: NormalizedChunk[];
	ambientModules: Set<string>;
}

function getChunksWithModule(moduleName: string, chunks: Iterable<NormalizedChunk>): Set<NormalizedChunk> {
	const chunksWithModule = new Set<NormalizedChunk>();
	// Test how many chunks include the module
	for (const chunk of chunks) {
		if (chunk.modules.includes(moduleName)) {
			chunksWithModule.add(chunk);
		}
	}

	return chunksWithModule;
}

function splitAmbientModule(moduleName: string, chunks: Iterable<NormalizedChunk>): void {
	const chunksWithModule = getChunksWithModule(moduleName, chunks);

	// Not more than 1 chunk can contain the module.
	// We'll have to move it over to another chunk that is common
	// between the two, if there is any.
	if (chunksWithModule.size > 1) {
		for (const chunk of chunksWithModule) {
			if (chunk.isEntry) {
				chunk.modules.splice(chunk.modules.indexOf(moduleName), 1);
				return splitAmbientModule(moduleName, chunks);
			}
		}

		// If we came this far, none of the chunks are entry chunks, but still the module is scattered across them.
		// In these cases, leave the module inside the first chunk
		const [, ...otherChunks] = chunksWithModule;
		for (const chunk of otherChunks) {
			chunk.modules.splice(chunk.modules.indexOf(moduleName), 1);
		}
	}
}

function splitAmbientModules(chunks: NormalizedChunk[], ambientModules: Set<string>) {
	for (const chunk of chunks) {
		for (const module of chunk.modules) {
			if (ambientModules.has(module)) {
				splitAmbientModule(module, chunks);
				const chunksWithModule = getChunksWithModule(module, chunks);

				if (chunksWithModule.size < 1) {
					throw new RangeError(`Expected module: '${module}' to exist within a chunk, but was found under none`);
				} else if (chunksWithModule.size !== 1) {
					throw new RangeError(
						`Expected module: '${module}' to exist within only chunk, but was found under chunks: ${[...chunksWithModule]
							.map(c => `'${c.fileName}'`)
							.join(",")}`
					);
				}
			}
		}
	}
}

export function mergeChunksWithAmbientDependencies(
	chunks: NormalizedChunk[],
	...moduleDependencyMaps: ModuleDependencyMap[]
): MergeChunksWithAmbientDependenciesResult {
	const ambientModules = new Set<string>();
	const mergedChunks: NormalizedChunk[] = JSON.parse(JSON.stringify(chunks));

	// Find ambient chunks that will be placed inside of shared chunks

	const allRollupChunkModules = new Set<string>();
	for (const chunk of mergedChunks) {
		for (const module of chunk.modules) {
			allRollupChunkModules.add(module);
		}
	}

	for (const moduleDependencyMap of moduleDependencyMaps) {
		for (const modules of moduleDependencyMap.values()) {
			for (const module of modules) {
				if (!allRollupChunkModules.has(module)) {
					ambientModules.add(module);
				}
			}
		}

		for (const [entry, moduleDependencies] of moduleDependencyMap.entries()) {
			for (let i = 0; i < mergedChunks.length; i++) {
				const chunk = mergedChunks[i];
				const entryIndex = chunk.modules.indexOf(entry);
				if (entryIndex < 0) continue;

				for (const dependency of [...moduleDependencies]
					.reverse()
					.filter(moduleDependency => ambientModules.has(moduleDependency) && !chunk.modules.includes(moduleDependency))) {
					chunk.modules.splice(entryIndex, 0, dependency);
				}
			}
		}
	}

	splitAmbientModules(mergedChunks, ambientModules);
	return {
		mergedChunks,
		ambientModules
	};
}
