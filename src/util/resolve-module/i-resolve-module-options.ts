import {IResolveBaseOptions} from "../resolve/i-resolve-options";

export interface IResolveModuleOptions extends IResolveBaseOptions {
	isBrowserScope: boolean;
	extensions: string[];
}