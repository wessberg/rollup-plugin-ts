import type {ModuleResolutionHostOptions} from "../module-resolution-host/module-resolution-host-options.js";
import type {CustomTransformersFunction} from "../../util/merge-transformers/custom-transformer-options.js";
import type {TS} from "../../type/ts.js";
import type {ResolveCache} from "../cache/resolve-cache/resolve-cache.js";

export type CustomTransformersInput = CustomTransformersFunction | TS.CustomTransformers | undefined;

export interface CompilerHostOptions extends ModuleResolutionHostOptions {
	filter(id: string): boolean;
	resolveCache: ResolveCache;
	transformers?: CustomTransformersInput;
	allowTransformingDeclarations?: boolean;
}
