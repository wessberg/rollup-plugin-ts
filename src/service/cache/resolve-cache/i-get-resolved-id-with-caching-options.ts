import {CompilerOptions, ModuleResolutionHost} from "typescript";

export interface IGetResolvedIdWithCachingOptions {
	id: string;
	parent: string;
	cwd: string;
	options: CompilerOptions;
	moduleResolutionHost: ModuleResolutionHost;
}