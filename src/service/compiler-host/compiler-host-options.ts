import {ModuleResolutionHostOptions} from "../module-resolution-host/module-resolution-host-options";
import {CustomTransformersFunction} from "../../util/merge-transformers/custom-transformer-options";
import {TS} from "../../type/ts";
import {ResolveCache} from "../cache/resolve-cache/resolve-cache";

export type CustomTransformersInput = CustomTransformersFunction | TS.CustomTransformers | undefined;

export interface CompilerHostOptions extends ModuleResolutionHostOptions {
	filter(id: string): boolean;
	resolveCache: ResolveCache;
	transformers?: CustomTransformersInput;
	allowTransformingDeclarations?: boolean;
}
