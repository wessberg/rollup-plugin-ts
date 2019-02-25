import {ExportDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ExportDeclaration.
 * @param {ExportDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitExportDeclaration(currentNode: ExportDeclaration, {continuation}: VisitorOptions): void {
	if (currentNode.exportClause != null) {
		for (const element of currentNode.exportClause.elements) {
			continuation(element);
		}
	}
}
