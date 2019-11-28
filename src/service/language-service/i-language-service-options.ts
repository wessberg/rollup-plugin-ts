import {IEmitCache} from "../cache/emit-cache/i-emit-cache";
import {InputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";
import {FileSystem} from "../../util/file-system/file-system";
import {IResolveCache} from "../cache/resolve-cache/i-resolve-cache";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";
import {TS} from "../../type/ts";

export interface ILanguageServiceOptions {
	parsedCommandLine: TS.ParsedCommandLine;
	cwd: TypescriptPluginOptions["cwd"];
	typescript: typeof TS;
	resolveTypescriptLibFrom: TypescriptPluginOptions["resolveTypescriptLibFrom"];
	transformers?: CustomTransformersFunction;
	emitCache: IEmitCache;
	resolveCache: IResolveCache;
	rollupInputOptions: InputOptions;
	supportedExtensions: SupportedExtensions;
	languageService(): TS.LanguageService;
	fileSystem: FileSystem;
}
