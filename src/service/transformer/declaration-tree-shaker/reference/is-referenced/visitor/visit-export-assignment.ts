import {ExportAssignment} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ExportDeclaration.
 * @param {ExportAssignment} currentNode
 * @param {VisitorOptions} options
 */
export function visitExportAssignment(currentNode: ExportAssignment, {continuation}: VisitorOptions): void {
	continuation(currentNode.expression);
}
