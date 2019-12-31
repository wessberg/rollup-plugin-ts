import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitExportDeclaration({node}: TreeShakerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration | undefined {
	return node;
}
