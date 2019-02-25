import {QualifiedName} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given QualifiedName.
 * @param {QualifiedName} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkQualifiedName(currentNode: QualifiedName, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.left);
}
