import {setExtension} from "../../../../util/path/path-util";
import {extname, join, normalize} from "path";
import {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../util/chunk/get-chunk-to-original-file-map";
import {ChunkForModuleCache} from "../declaration-bundler-options";

export interface GetChunkFilenameOptions {
	fileName: string;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	chunkForModuleCache: ChunkForModuleCache;
}

/**
 * Gets the chunk filename that matches the given filename. It may be the same.
 */
export function getChunkFilename({
	chunkForModuleCache,
	chunkToOriginalFileMap,
	fileName,
	supportedExtensions
}: GetChunkFilenameOptions): string | undefined {
	const normalizedFileName = normalize(fileName);
	if (chunkForModuleCache.has(normalizedFileName)) {
		return chunkForModuleCache.get(normalizedFileName)!;
	}
	for (const [chunkFilename, originalSourceFilenames] of chunkToOriginalFileMap) {
		const filenames = [normalizedFileName, join(fileName, "/index")];
		for (const file of filenames) {
			for (const originalSourceFilename of originalSourceFilenames) {
				if (originalSourceFilename === file) {
					chunkForModuleCache.set(normalizedFileName, chunkFilename);
					return chunkFilename;
				}

				for (const extension of [extname(file), ...supportedExtensions]) {
					if (originalSourceFilename === setExtension(file, extension)) {
						chunkForModuleCache.set(normalizedFileName, chunkFilename);
						return chunkFilename;
					}
				}
			}
		}
	}
	chunkForModuleCache.set(normalizedFileName, undefined);
	return undefined;
}
