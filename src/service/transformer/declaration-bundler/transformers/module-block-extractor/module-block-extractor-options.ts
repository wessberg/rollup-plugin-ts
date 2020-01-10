import {TS} from "../../../../../type/ts";
import {TypescriptPluginOptions} from "../../../../../plugin/i-typescript-plugin-options";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface ModuleBlockExtractorOptions extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	context: TS.TransformationContext;
	pluginOptions: TypescriptPluginOptions;
	printer: TS.Printer;
	sourceFile: TS.SourceFile;
}
