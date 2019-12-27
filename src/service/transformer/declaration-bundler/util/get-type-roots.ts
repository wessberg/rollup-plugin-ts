import {TS} from "../../../../type/ts";
import {sync} from "find-up";
import {isAbsolute, join, nativeNormalize, normalize} from "../../../../util/path/path-util";
import {DEFAULT_TYPES_ROOT, NODE_MODULES} from "../../../../constant/constant";

export interface GetTypeRootsOptions {
	compilerOptions: TS.CompilerOptions;
	cwd: string;
}

export function getTypeRoots({compilerOptions, cwd}: GetTypeRootsOptions): Set<string> {
	if (compilerOptions.typeRoots == null) {
		const resolved = sync(nativeNormalize(`${NODE_MODULES}/${DEFAULT_TYPES_ROOT}`), {cwd, type: "directory"});
		return resolved == null ? new Set() : new Set([normalize(resolved)]);
	} else {
		return new Set(compilerOptions.typeRoots.map(normalize).map(typeRoot => (isAbsolute(typeRoot) ? typeRoot : join(cwd, typeRoot))));
	}
}
