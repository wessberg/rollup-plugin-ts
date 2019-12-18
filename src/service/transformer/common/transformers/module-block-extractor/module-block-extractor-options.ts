import {TS} from "../../../../../type/ts";
import {TypescriptPluginOptions} from "../../../../../plugin/i-typescript-plugin-options";

export interface ModuleBlockExtractorOptions {
	typescript: typeof TS;
	context: TS.TransformationContext;
	pluginOptions: TypescriptPluginOptions;
	printer: TS.Printer;
	sourceFile: TS.SourceFile;
}
