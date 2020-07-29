import {CompilerHost} from "../../../compiler-host/compiler-host";

export interface TypeModuleReferenceIsAllowedOptions {
	host: CompilerHost;
	moduleSpecifier: string;
}

export function typeModuleReferenceIsAllowed({host, moduleSpecifier}: TypeModuleReferenceIsAllowedOptions): boolean {
	const compilerOptions = host.getCompilationSettings();
	if (compilerOptions.types == null || compilerOptions.types.length < 1) return true;
	return compilerOptions.types.includes(moduleSpecifier);
}
