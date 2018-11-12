import {OutputChunk, OutputOptions} from "rollup";
import {CompilerOptions, LanguageService} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {IEmitCache} from "../../service/cache/emit-cache/i-emit-cache";

export interface IEmitDeclarationsOptions {
	cwd: string;
	chunk: OutputChunk;
	outputOptions: OutputOptions;
	compilerOptions: CompilerOptions;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	emitCache: IEmitCache;
}