import {IGetResolvedIdWithCachingOptions} from "./i-get-resolved-id-with-caching-options";
import {ResolvedModuleFull} from "typescript";

export interface ExtendedResolvedModule extends Omit<ResolvedModuleFull, "resolvedFileName"> {
	resolvedFileName: string | undefined;
	resolvedAmbientFileName: string | undefined;
}

export interface IResolveCache {
	getFromCache(id: string, parent: string): ExtendedResolvedModule | null | undefined;
	delete(parent: string): boolean;
	clear(): void;
	setInCache(result: ExtendedResolvedModule | null, id: string, parent: string): ExtendedResolvedModule | null;
	get(options: IGetResolvedIdWithCachingOptions): ExtendedResolvedModule | null;
	findHelperFromNodeModules(path: string, cwd: string): string | undefined;
}
