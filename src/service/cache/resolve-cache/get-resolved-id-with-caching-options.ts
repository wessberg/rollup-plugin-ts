import {ModuleResolutionHost} from "../../module-resolution-host/module-resolution-host";

export interface GetResolvedIdWithCachingOptions {
	id: string;
	parent: string;
	moduleResolutionHost: ModuleResolutionHost;
}
