import {CustomTransformers, LanguageService, Program} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {FoveaDiagnostic} from "../../fovea/diagnostic/fovea-diagnostic";

export interface ICustomTransformerOptions {
	program: Program|undefined;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	addDiagnostics (...diagnostics: FoveaDiagnostic[]): void;
}

export type CustomTransformersFunction = (options: ICustomTransformerOptions) => CustomTransformers;