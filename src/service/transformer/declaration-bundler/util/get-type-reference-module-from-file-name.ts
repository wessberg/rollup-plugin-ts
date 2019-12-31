import {typeModuleReferenceIsAllowed} from "./type-module-reference-is-allowed";
import {TS} from "../../../../type/ts";
import {dirname} from "../../../../util/path/path-util";

export interface GetTypeReferenceModuleFromFileNameOptions {
	typeRoots: Set<string>;
	compilerOptions: TS.CompilerOptions;
	fileName: string;
}

export function getTypeReferenceModuleFromFileName({
	typeRoots,
	compilerOptions,
	fileName
}: GetTypeReferenceModuleFromFileNameOptions): string | undefined {
	for (const typeRoot of typeRoots) {
		if (!fileName.includes(typeRoot)) continue;
		const typeModule = dirname(fileName.slice(typeRoot.length + 1));

		if (typeModuleReferenceIsAllowed({compilerOptions, typeModule})) {
			return typeModule;
		}
	}

	return undefined;
}
