import {IncrementalLanguageService} from "../language-service/incremental-language-service";

export interface IModuleResolutionHostOptions {
	languageServiceHost: IncrementalLanguageService;
	extensions: string[];
}
