import {IncrementalLanguageService} from "../language-service/incremental-language-service";
import {ModuleResolutionHost} from "../module-resolution-host/module-resolution-host";
import {LanguageService} from "typescript";

export interface ICompilerHostOptions {
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	moduleResolutionHost: ModuleResolutionHost;
}