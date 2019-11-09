import {ExportDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitExportDeclaration({node}: TreeShakerVisitorOptions<ExportDeclaration>): ExportDeclaration | undefined {
	return node;
}
