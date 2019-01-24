import {LanguageService, ParsedCommandLine} from "typescript";
import {IEmitCache} from "../cache/emit-cache/i-emit-cache";
import {InputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";

export interface ILanguageServiceOptions {
	parsedCommandLine: ParsedCommandLine;
	cwd: TypescriptPluginOptions["cwd"];
	transformers?: CustomTransformersFunction;
	emitCache: IEmitCache;
	rollupInputOptions: InputOptions;
	supportedExtensions: string[];
	languageService(): LanguageService;
}
