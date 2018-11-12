import {LanguageService} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {OutputChunk} from "rollup";
import {IEmitCache} from "../../service/cache/emit-cache/i-emit-cache";

export interface IFlattenDeclarationsFromRollupChunkOptions {
	chunk: OutputChunk;
	generateMap: boolean;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	emitCache: IEmitCache;
}