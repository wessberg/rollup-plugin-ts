import {ExportDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ExportDeclaration.
 * @param {ExportDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkExportDeclaration(currentNode: ExportDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	if (currentNode.exportClause != null) {
		for (const element of currentNode.exportClause.elements) {
			if (continuation(element)) return true;
		}
	}

	return false;
}
