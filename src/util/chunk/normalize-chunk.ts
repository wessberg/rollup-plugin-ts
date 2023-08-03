import type {OutputChunk, OutputOptions} from "rollup";
import {getOutDir} from "../get-out-dir/get-out-dir.js";
import type {PathsResult} from "../../service/transformer/declaration-bundler/util/prepare-paths/prepare-paths.js";
import {preparePaths} from "../../service/transformer/declaration-bundler/util/prepare-paths/prepare-paths.js";
import type {CompilerHost} from "../../service/compiler-host/compiler-host.js";
import {ROLLUP_PLUGIN_MULTI_ENTRY_LEGACY} from "../../constant/constant.js";
import path from "crosspath";
import {removeSearchPathFromFilename} from "../path/path-util.js";

export interface PreNormalizedChunk {
	fileName: string;
	isEntry: boolean;
	modules: string[];
}

export interface NormalizedChunk {
	paths: PathsResult;
	isEntry: boolean;
	modules: Set<string>;
	entryModules: Set<string>;
}

export interface NormalizeChunkOptions {
	host: CompilerHost;
	outputOptions: OutputOptions;
	relativeOutDir: string;
	multiEntryModule: string | undefined;
	multiEntryFileNames: Set<string> | undefined;
}

export function preNormalizeChunk(chunk: OutputChunk, otherChunks: OutputChunk[]): PreNormalizedChunk {
	const baseModules = new Set(Object.keys(chunk.modules).map(normalizeChunkFilename));

	// Make sure to remove any base modules that are also entry modules in other chunks
	for (const baseModule of baseModules) {
		if (otherChunks.some(otherChunk => otherChunk.isEntry && otherChunk.facadeModuleId === baseModule)) {
			baseModules.delete(baseModule);
		}
	}

	// Add the facadeModuleId to the base modules if it is an entry chunk and it wasn't already there.
	// Since Rollup v3.22.0, the facadeModuleId may no longer be included in the modules of the chunk if it only contains imports/exports, so we'll have to add it manually
	if (chunk.isEntry && chunk.facadeModuleId != null && !baseModules.has(chunk.facadeModuleId)) {
		baseModules.add(chunk.facadeModuleId);
	}

	return {
		modules: [...baseModules],
		fileName: path.normalize(chunk.fileName),
		isEntry: chunk.isEntry
	};
}

export function normalizeChunkFilename(filename: string): string {
	return removeSearchPathFromFilename(path.normalize(filename));
}

export function normalizeChunk(chunk: PreNormalizedChunk, {host, outputOptions, relativeOutDir, multiEntryModule, multiEntryFileNames}: NormalizeChunkOptions): NormalizedChunk {
	const cwd = host.getCwd();
	let entryModules: string[] | undefined;
	let isMultiEntryChunk = false;

	for (let i = 0; i < chunk.modules.length; i++) {
		const module = chunk.modules[i];

		if (multiEntryFileNames != null && (module === ROLLUP_PLUGIN_MULTI_ENTRY_LEGACY || (multiEntryModule != null && module === multiEntryModule))) {
			// Reassign the entry file names accordingly
			chunk.modules.splice(i, 1, ...[...multiEntryFileNames].filter(fileName => !chunk.modules.includes(fileName)));
			isMultiEntryChunk = true;
		}
	}

	// Ensure that there are no duplicates
	chunk.modules = [...new Set(chunk.modules)];

	const visitableModules = chunk.modules.filter(module => host.isSupportedFileName(module, true));

	// If no entry module is predetermined, it should be the module on the last position for an entry chunk, or
	// every visible module for a non-entry chunk
	if (entryModules == null) {
		entryModules = isMultiEntryChunk && multiEntryFileNames != null ? [...multiEntryFileNames] : chunk.isEntry ? [visitableModules.slice(-1)[0]] : [...visitableModules].reverse();
	}

	return {
		isEntry: chunk.isEntry,
		paths: preparePaths({
			fileName: path.normalize(chunk.fileName),
			relativeOutDir: getOutDir(cwd, outputOptions),
			absoluteOutDir: path.join(cwd, relativeOutDir)
		}),
		modules: new Set(chunk.modules),
		entryModules: new Set(entryModules)
	};
}
