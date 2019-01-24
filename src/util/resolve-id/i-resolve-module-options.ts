import {IResolveBaseOptions} from "../resolve/i-resolve-options";
import {CompilerOptions} from "typescript";
import {ModuleResolutionHost} from "../../service/module-resolution-host/module-resolution-host";
import {IResolveCache} from "../../service/cache/resolve-cache/i-resolve-cache";

export interface IResolveModuleOptions extends IResolveBaseOptions {
	options: CompilerOptions;
	moduleResolutionHost: ModuleResolutionHost;
	resolveCache: IResolveCache;
	cwd: string;
}
