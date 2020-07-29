import {typeModuleReferenceIsAllowed} from "./type-module-reference-is-allowed";
import {normalize} from "../../../../util/path/path-util";
import {CompilerHost} from "../../../compiler-host/compiler-host";

export interface GetTypeReferenceModuleFromFileNameOptions {
	host: CompilerHost;
	fileName: string;
}

export interface TypeReference {
	moduleSpecifier: string;
	fileName: string;
}

export function getTypeReferenceModuleFromFileName({host, fileName}: GetTypeReferenceModuleFromFileNameOptions): TypeReference | undefined {
	for (const typeRoot of host.getTypeRoots()) {
		if (!fileName.includes(typeRoot)) continue;
		const base = normalize(fileName.slice(typeRoot.length + 1));
		const moduleSpecifier = base.includes("/") ? base.slice(0, base.indexOf("/")) : base;

		if (typeModuleReferenceIsAllowed({host, moduleSpecifier})) {
			return {
				moduleSpecifier,
				fileName
			};
		}
	}

	return undefined;
}
