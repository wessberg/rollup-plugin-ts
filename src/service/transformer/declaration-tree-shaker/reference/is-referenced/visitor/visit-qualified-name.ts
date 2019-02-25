import {QualifiedName} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given QualifiedName.
 * @param {QualifiedName} currentNode
 * @param {VisitorOptions} options
 */
export function visitQualifiedName(currentNode: QualifiedName, {continuation}: VisitorOptions): void {
	continuation(currentNode.left);
}
