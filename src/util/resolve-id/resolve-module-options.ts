import {GetResolvedIdWithCachingOptions} from "../../service/cache/resolve-cache/get-resolved-id-with-caching-options";
import {ResolveCache} from "../../service/cache/resolve-cache/resolve-cache";

export interface ResolveModuleOptions extends GetResolvedIdWithCachingOptions {
	resolveCache: ResolveCache;
}
