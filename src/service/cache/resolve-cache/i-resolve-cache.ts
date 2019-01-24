import {IGetResolvedIdWithCachingOptions} from "./i-get-resolved-id-with-caching-options";

export interface IResolveCache {
	getFromCache(id: string, parent: string): string | null | undefined;
	delete(parent: string): boolean;
	setInCache(result: string | null, id: string, parent: string): string | null;
	get(options: IGetResolvedIdWithCachingOptions): string | null;
}
