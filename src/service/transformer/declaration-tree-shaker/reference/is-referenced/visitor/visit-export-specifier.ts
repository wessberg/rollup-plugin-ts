import {ExportSpecifier} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ExportSpecifier.
 * @param {ExportSpecifier} currentNode
 * @param {VisitorOptions} options
 */
export function visitExportSpecifier(currentNode: ExportSpecifier, {continuation}: VisitorOptions): void {
	if (currentNode.propertyName != null) {
		continuation(currentNode.propertyName);
	} else {
		continuation(currentNode.name);
	}
}
