import {typeModuleReferenceIsAllowed} from "./type-module-reference-is-allowed.js";
import type {CompilerHost} from "../../../compiler-host/compiler-host.js";
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
		const typeRootIndex = fileName.indexOf(typeRoot);
		if (typeRootIndex < 0) continue;

		const base = path.normalize(fileName.slice(typeRootIndex + typeRoot.length + 1));
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
