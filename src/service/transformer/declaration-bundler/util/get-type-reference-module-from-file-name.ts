import {typeModuleReferenceIsAllowed} from "./type-module-reference-is-allowed";
import {dirname} from "../../../../util/path/path-util";
import {CompilerHost} from "../../../compiler-host/compiler-host";

export interface GetTypeReferenceModuleFromFileNameOptions {
	host: CompilerHost;
	fileName: string;
}

export function getTypeReferenceModuleFromFileName({host, fileName}: GetTypeReferenceModuleFromFileNameOptions): string | undefined {
	for (const typeRoot of host.getTypeRoots()) {
		if (!fileName.includes(typeRoot)) continue;
		const typeModule = dirname(fileName.slice(typeRoot.length + 1));

		if (typeModuleReferenceIsAllowed({host, typeModule})) {
			return typeModule;
		}
	}

	return undefined;
}
