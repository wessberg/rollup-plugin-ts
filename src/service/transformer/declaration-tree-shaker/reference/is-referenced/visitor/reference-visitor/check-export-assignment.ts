import {ExportAssignment} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ExportDeclaration.
 * @param {ExportAssignment} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkExportAssignment(currentNode: ExportAssignment, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.expression);
}
