import type {TS} from "../../../../../type/ts.js";
import type {TypescriptPluginOptions} from "../../../../../plugin/typescript-plugin-options.js";
import type {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";

export interface ModuleBlockExtractorOptions extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	context: TS.TransformationContext;
	pluginOptions: TypescriptPluginOptions;
	printer: TS.Printer;
	sourceFile: TS.SourceFile;
}
