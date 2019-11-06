import {LanguageService, ParsedCommandLine} from "typescript";
import {IEmitCache} from "../cache/emit-cache/i-emit-cache";
import {InputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";
import {FileSystem} from "../../util/file-system/file-system";

export interface ILanguageServiceOptions {
	parsedCommandLine: ParsedCommandLine;
	cwd: TypescriptPluginOptions["cwd"];
	resolveTypescriptLibFrom: TypescriptPluginOptions['resolveTypescriptLibFrom']
	transformers?: CustomTransformersFunction;
	emitCache: IEmitCache;
	rollupInputOptions: InputOptions;
	supportedExtensions: string[];
	languageService(): LanguageService;
	fileSystem: FileSystem;
}
