import {OutputChunk, OutputFile} from "rollup";

/**
 * Returns true if the given file is an OutputChunk
 * @param {OutputChunk | OutputFile} file
 * @return {file is OutputChunk}
 */
export function isOutputChunk (file: OutputChunk|OutputFile): file is OutputChunk {
	return typeof file !== "string" && !(file instanceof Buffer);
}