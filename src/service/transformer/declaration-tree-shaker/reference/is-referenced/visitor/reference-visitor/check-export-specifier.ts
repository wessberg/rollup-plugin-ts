import {ExportSpecifier} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ExportSpecifier.
 * @param {ExportSpecifier} currentNode
 * @param {ReferenceVisitorOptions} options
 */
export function checkExportSpecifier(currentNode: ExportSpecifier, {continuation}: ReferenceVisitorOptions): boolean {
	if (currentNode.propertyName != null) {
		if (continuation(currentNode.propertyName)) return true;
	} else {
		if (continuation(currentNode.name)) return true;
	}

	return false;
}
