import {CompilerOptions} from "typescript";
import {ModuleResolutionHost} from "../../service/module-resolution-host/module-resolution-host";
import {IResolveCache} from "../../service/cache/resolve-cache/i-resolve-cache";

export interface IResolveModuleOptions {
	id: string;
	parent: string;
	options: CompilerOptions;
	moduleResolutionHost: ModuleResolutionHost;
	resolveCache: IResolveCache;
	cwd: string;
}
