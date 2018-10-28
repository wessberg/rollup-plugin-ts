import {LanguageService} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {RenderedChunk} from "rollup";

export interface IFlattenDeclarationsFromRollupChunkOptions {
	chunk: RenderedChunk;
	generateMap: boolean;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
}