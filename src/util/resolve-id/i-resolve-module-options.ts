import {IGetResolvedIdWithCachingOptions} from "../../service/cache/resolve-cache/i-get-resolved-id-with-caching-options";
import {IResolveCache} from "../../service/cache/resolve-cache/i-resolve-cache";

export interface IResolveModuleOptions extends IGetResolvedIdWithCachingOptions {
	resolveCache: IResolveCache;
}
