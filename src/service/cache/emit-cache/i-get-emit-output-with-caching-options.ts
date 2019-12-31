import {TS} from "../../../type/ts";

export interface IGetEmitOutputWithCachingOptions {
	languageService: TS.LanguageService;
	fileName: string;
	dtsOnly?: boolean;
}
