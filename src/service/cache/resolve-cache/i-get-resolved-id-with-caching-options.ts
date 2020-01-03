import {ModuleResolutionHost} from "../../module-resolution-host/module-resolution-host";

export interface IGetResolvedIdWithCachingOptions {
	id: string;
	parent: string;
	moduleResolutionHost: ModuleResolutionHost;
}
