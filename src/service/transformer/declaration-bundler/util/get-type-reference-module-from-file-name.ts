import {typeModuleReferenceIsAllowed} from "./type-module-reference-is-allowed";
import {CompilerHost} from "../../../compiler-host/compiler-host";
import path from "crosspath";

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
		const base = path.normalize(fileName.slice(typeRoot.length + 1));
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
