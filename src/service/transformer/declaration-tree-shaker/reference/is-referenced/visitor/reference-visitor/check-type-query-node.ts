import {TypeQueryNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given TypeQueryNode.
 * @param {TypeQueryNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * ®returns {boolean}
 */
export function checkTypeQueryNode(currentNode: TypeQueryNode, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.exprName);
}
