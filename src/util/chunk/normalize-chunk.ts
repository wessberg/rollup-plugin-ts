import {OutputChunk, OutputOptions} from "rollup";
import {join, normalize} from "../path/path-util";
import {getOutDir} from "../get-out-dir/get-out-dir";
import {PathsResult, preparePaths} from "../../service/transformer/declaration-bundler/util/prepare-paths/prepare-paths";
import {ROLLUP_PLUGIN_MULTI_ENTRY} from "../../constant/constant";
import {CompilerHost} from "../../service/compiler-host/compiler-host";

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
	multiEntryFileNames: Set<string> | undefined;
}

export function preNormalizeChunk(chunk: OutputChunk): PreNormalizedChunk {
	return {
		modules: Object.keys(chunk.modules).map(normalize),
		fileName: normalize(chunk.fileName),
		isEntry: chunk.isEntry
	};
}

export function normalizeChunk(
	chunk: PreNormalizedChunk,
	{host, outputOptions, relativeOutDir, multiEntryFileNames}: NormalizeChunkOptions
): NormalizedChunk {
	const cwd = host.getCwd();

	for (let i = 0; i < chunk.modules.length; i++) {
		const module = chunk.modules[i];

		if (module === ROLLUP_PLUGIN_MULTI_ENTRY && multiEntryFileNames != null) {
			// Reassign the entry file names accordingly
			chunk.modules.splice(i, 1, ...multiEntryFileNames);
		}
	}

	const visitableModules = chunk.modules.filter(module => host.isSupportedFileName(module));
	let entryModules = chunk.isEntry ? [visitableModules.slice(-1)[0]] : [...visitableModules].reverse();

	return {
		isEntry: chunk.isEntry,
		paths: preparePaths({
			fileName: normalize(chunk.fileName),
			relativeOutDir: getOutDir(cwd, outputOptions),
			absoluteOutDir: join(cwd, relativeOutDir)
		}),
		modules: new Set(chunk.modules),
		entryModules: new Set(entryModules)
	};
}
