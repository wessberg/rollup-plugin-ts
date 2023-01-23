import type {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

export function visitExportDeclaration({node}: TreeShakerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration | undefined {
	return node;
}
