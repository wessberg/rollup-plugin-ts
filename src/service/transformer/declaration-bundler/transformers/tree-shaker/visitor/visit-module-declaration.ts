import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitModuleDeclaration({node}: TreeShakerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration | undefined {
	return node;
}
