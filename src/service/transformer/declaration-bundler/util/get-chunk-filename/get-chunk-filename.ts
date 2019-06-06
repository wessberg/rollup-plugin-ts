import {setExtension} from "../../../../../util/path/path-util";
import {join, normalize} from "path";

/**
 * Gets the chunk filename that matches the given filename. It may be the same.
 * @param {string} filename
 * @param {string[]} supportedExtensions
 * @param {Map<string, string[]>} chunkToOriginalFileMap
 * @return {string}
 */
export function getChunkFilename(filename: string, supportedExtensions: string[], chunkToOriginalFileMap: Map<string, string[]>): string {
	for (const [chunkFilename, originalSourceFilenames] of chunkToOriginalFileMap) {
		const filenames = [normalize(filename), join(filename, "/index")];
		for (const file of filenames) {
			for (const originalSourceFilename of originalSourceFilenames) {
				if (originalSourceFilename === file) return chunkFilename;

				for (const extension of supportedExtensions) {
					if (originalSourceFilename === setExtension(file, extension)) return chunkFilename;
				}
			}
		}
	}
	return normalize(filename);
}
