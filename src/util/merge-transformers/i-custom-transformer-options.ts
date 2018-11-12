import {CustomTransformers, LanguageService, Program} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";

export interface ICustomTransformerOptions {
	program: Program|undefined;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
}

export type CustomTransformersFunction = (options: ICustomTransformerOptions) => CustomTransformers;