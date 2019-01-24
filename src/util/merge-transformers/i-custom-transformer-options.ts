import {CustomTransformers, LanguageService, Program} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";

export interface ICustomTransformerOptions {
	program: Program | undefined;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	addDiagnostics(...diagnostics: IExtendedDiagnostic[]): void;
}

export type CustomTransformersFunction = (options: ICustomTransformerOptions) => CustomTransformers;
