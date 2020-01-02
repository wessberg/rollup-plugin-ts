import {IEmitCache} from "../cache/emit-cache/i-emit-cache";
import {InputOptions} from "rollup";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";
import {IResolveCache} from "../cache/resolve-cache/i-resolve-cache";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";
import {TS} from "../../type/ts";
import {ModuleResolutionHostOptions} from "../module-resolution-host/module-resolution-host-options";

export interface LanguageServiceHostOptions extends ModuleResolutionHostOptions {
	languageService(): TS.LanguageService;
	filter(id: string): boolean;
	parsedCommandLine: TS.ParsedCommandLine;
	typescript: typeof TS;
	transformers?: CustomTransformersFunction;
	emitCache: IEmitCache;
	resolveCache: IResolveCache;
	rollupInputOptions: InputOptions;
	supportedExtensions: SupportedExtensions;
}
