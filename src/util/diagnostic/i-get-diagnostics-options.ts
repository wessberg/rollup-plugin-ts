import {PluginContext} from "rollup";
import {LanguageServiceHost} from "../../service/language-service/language-service-host";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {TS} from "../../type/ts";

export interface IGetDiagnosticsOptions {
	typescript: typeof TS;
	languageServiceHost: LanguageServiceHost;
	context: PluginContext;
	pluginOptions: TypescriptPluginOptions;
}
