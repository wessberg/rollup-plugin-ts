import {OutputChunk} from "rollup";
import {normalize} from "../path/path-util";

export interface NormalizedChunk {
	fileName: string;
	isEntry: boolean;
	modules: string[];
}

export function normalizeChunk(chunk: OutputChunk): NormalizedChunk {
	return {
		fileName: normalize(chunk.fileName),
		isEntry: chunk.isEntry,
		modules: Object.keys(chunk.modules).map(normalize)
	};
}
