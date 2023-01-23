import type {GetResolvedIdWithCachingOptions} from "../../service/cache/resolve-cache/get-resolved-id-with-caching-options.js";
import type {ResolveCache} from "../../service/cache/resolve-cache/resolve-cache.js";

export interface ResolveModuleOptions extends GetResolvedIdWithCachingOptions {
	resolveCache: ResolveCache;
}
