import {LanguageService, ParsedCommandLine} from "typescript";
import {IEmitCache} from "../cache/emit-cache/i-emit-cache";
import {InputOptions} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";

export interface ILanguageServiceOptions {
	parsedCommandLine: ParsedCommandLine;
	cwd: TypescriptPluginOptions["cwd"];
	transformers?: TypescriptPluginOptions["transformers"];
	emitCache: IEmitCache;
	rollupInputOptions: InputOptions;
	supportedExtensions: string[];
	languageService (): LanguageService;
}