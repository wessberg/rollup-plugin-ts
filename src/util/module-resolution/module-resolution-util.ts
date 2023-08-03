import type {TS} from "../../type/ts.js";

/**
 * On TypeScript versions 4.5 and 4.6, nodenext is available as a Compiler Option, but selecting it
 * will throw.
 */
export function allowsNodeNextModuleResolution(typescript: typeof TS): boolean {
    // If 'Node16' module resolution is available, NodeNext is allowed to be selected as a ModuleResolutionKind.
    // This happened in v4.7
	return typescript.ModuleResolutionKind.Node16 != null;
}
