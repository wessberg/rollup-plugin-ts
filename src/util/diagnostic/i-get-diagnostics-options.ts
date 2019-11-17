import {LanguageService} from "typescript";
import {PluginContext} from "rollup";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";

export interface IGetDiagnosticsOptions {
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	context: PluginContext;
	pluginOptions: TypescriptPluginOptions;
}
