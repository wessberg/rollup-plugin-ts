import {PluginContext} from "rollup";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {TS} from "../../type/ts";

export interface IGetDiagnosticsOptions {
	languageService: TS.LanguageService;
	typescript: typeof TS;
	languageServiceHost: IncrementalLanguageService;
	context: PluginContext;
	pluginOptions: TypescriptPluginOptions;
}
