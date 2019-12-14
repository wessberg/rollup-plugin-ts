import {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../util/chunk/get-chunk-to-original-file-map";
import {ChunkForModuleCache} from "../declaration-bundler-options";
import {getChunkFilename, GetChunkFilenameOptions} from "./get-chunk-filename";

export interface HasSameChunkOptions extends Omit<GetChunkFilenameOptions, "fileName"> {
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	chunkForModuleCache: ChunkForModuleCache;
}

export function hasSameChunk(sourceFileA: string, sourceFileB: string, options: HasSameChunkOptions): boolean {
	return getChunkFilename({...options, fileName: sourceFileA}) === getChunkFilename({...options, fileName: sourceFileB});
}
