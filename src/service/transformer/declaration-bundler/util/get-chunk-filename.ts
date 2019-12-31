import {extname, join, setExtension} from "../../../../util/path/path-util";
import {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions";
import {NormalizedChunk} from "../../../../util/chunk/normalize-chunk";

export interface GetChunkFilenameOptions {
	fileName: string;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: Map<string, string[]>;
}

export function getChunkForModule(module: string, chunks: NormalizedChunk[]): NormalizedChunk | undefined {
	for (const chunk of chunks) {
		if (chunk.modules.includes(module)) {
			return chunk;
		}
	}

	return undefined;
}

/**
 * Gets the chunk filename that matches the given filename. It may be the same.
 */
export function getChunkFilename({chunkToOriginalFileMap, fileName, supportedExtensions}: GetChunkFilenameOptions): string | undefined {
	for (const [chunkFilename, originalSourceFilenames] of chunkToOriginalFileMap) {
		const filenames = [fileName, join(fileName, "/index")];
		for (const file of filenames) {
			for (const originalSourceFilename of originalSourceFilenames) {
				if (originalSourceFilename === file) {
					return chunkFilename;
				}

				for (const extension of [extname(file), ...supportedExtensions]) {
					if (originalSourceFilename === setExtension(file, extension)) {
						return chunkFilename;
					}
				}
			}
		}
	}
	return undefined;
}
