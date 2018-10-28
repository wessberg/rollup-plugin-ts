import {OutputOptions, RenderedChunk} from "rollup";
import {CompilerOptions, LanguageService} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";

export interface IEmitDeclarationsOptions {
	cwd: string;
	chunk: RenderedChunk;
	outputOptions: OutputOptions;
	compilerOptions: CompilerOptions;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
}