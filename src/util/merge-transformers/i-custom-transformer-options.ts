import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";
import {TS} from "../../type/ts";

export interface ICustomTransformerOptions {
	program: TS.Program | undefined;
	languageService: TS.LanguageService;
	languageServiceHost: IncrementalLanguageService;
	addDiagnostics(...diagnostics: IExtendedDiagnostic[]): void;
}

export type CustomTransformersFunction = (options: ICustomTransformerOptions) => TS.CustomTransformers;
