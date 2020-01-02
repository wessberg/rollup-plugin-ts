import {LanguageServiceHost} from "../../service/language-service/language-service-host";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";
import {TS} from "../../type/ts";

export interface ICustomTransformerOptions {
	program: TS.Program | undefined;
	languageService: TS.LanguageService;
	languageServiceHost: LanguageServiceHost;
	addDiagnostics(...diagnostics: IExtendedDiagnostic[]): void;
}

export type CustomTransformersFunction = (options: ICustomTransformerOptions) => TS.CustomTransformers;
