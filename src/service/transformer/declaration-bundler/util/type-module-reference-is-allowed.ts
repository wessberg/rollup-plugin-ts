import {TS} from "../../../../type/ts";

export interface TypeModuleReferenceIsAllowedOptions {
	compilerOptions: TS.CompilerOptions;
	typeModule: string;
}

export function typeModuleReferenceIsAllowed({compilerOptions, typeModule}: TypeModuleReferenceIsAllowedOptions): boolean {
	if (compilerOptions.types == null || compilerOptions.types.length < 1) return true;
	return compilerOptions.types.includes(typeModule);
}
