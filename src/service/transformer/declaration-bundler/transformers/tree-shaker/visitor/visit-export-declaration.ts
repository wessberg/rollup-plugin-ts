import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitExportDeclaration({node}: TreeShakerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration | undefined {
	return node;
}
