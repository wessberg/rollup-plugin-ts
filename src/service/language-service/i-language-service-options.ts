import {LanguageService, ParsedCommandLine} from "typescript";
import {IEmitCache} from "../cache/emit-cache/i-emit-cache";
import {InputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";
import {FileSystem} from "../../util/file-system/file-system";
import {IResolveCache} from "../cache/resolve-cache/i-resolve-cache";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";

export interface ILanguageServiceOptions {
	parsedCommandLine: ParsedCommandLine;
	cwd: TypescriptPluginOptions["cwd"];
	resolveTypescriptLibFrom: TypescriptPluginOptions['resolveTypescriptLibFrom']
	transformers?: CustomTransformersFunction;
	emitCache: IEmitCache;
	resolveCache: IResolveCache;
	rollupInputOptions: InputOptions;
	supportedExtensions: SupportedExtensions;
	languageService(): LanguageService;
	fileSystem: FileSystem;
}
