import {ModuleResolutionHostOptions} from "../module-resolution-host/module-resolution-host-options";
import {IResolveCache} from "../cache/resolve-cache/i-resolve-cache";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";

export interface CompilerHostOptions extends ModuleResolutionHostOptions {
	filter(id: string): boolean;
	resolveCache: IResolveCache;
	transformers?: CustomTransformersFunction;
}
