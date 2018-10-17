import {LanguageService} from "typescript";

export interface IGetEmitOutputWithCachingOptions {
	languageService: LanguageService;
	fileName: string;
	dtsOnly?: boolean;
}