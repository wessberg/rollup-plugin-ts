import {OutputChunk} from "rollup";
import {normalize} from "path";

export interface NormalizedChunk {
	fileName: string;
	isEntry: boolean;
	modules: string[];
}

export function normalizeChunk(chunk: OutputChunk) {
	return {
		fileName: normalize(chunk.fileName),
		isEntry: chunk.isEntry,
		modules: Object.keys(chunk.modules).map(normalize)
	};
}
