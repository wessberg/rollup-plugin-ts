import {setExtension} from "../../../../../util/path/path-util";
import {extname, join, normalize} from "path";
import {SupportedExtensions} from "../../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../../util/chunk/get-chunk-to-original-file-map";

export interface GetChunkFilenameResult {
	fileName: string;
	isAmbient: boolean;
}

/**
 * Gets the chunk filename that matches the given filename. It may be the same.
 * @param {string} filename
 * @param {SupportedExtensions} supportedExtensions
 * @param {ChunkToOriginalFileMap} chunkToOriginalFileMap
 * @return {string|undefined}
 */
export function getChunkFilename (filename: string, supportedExtensions: SupportedExtensions, chunkToOriginalFileMap: ChunkToOriginalFileMap): GetChunkFilenameResult|undefined {
	for (const [chunkFilename, originalSourceFilenames] of chunkToOriginalFileMap) {
		const filenames = [normalize(filename), join(filename, "/index")];
		for (const file of filenames) {
			for (const [originalSourceFilename, isAmbient] of originalSourceFilenames) {
				if (originalSourceFilename === file) {
					return {fileName: chunkFilename, isAmbient};
				}

				for (const extension of [extname(file), ...supportedExtensions]) {
					if (originalSourceFilename === setExtension(file, extension)) {
						return {fileName: chunkFilename, isAmbient};
					}
				}
			}
		}
	}
	return undefined;
}
