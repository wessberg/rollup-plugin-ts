import {TypePredicateNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given TypePredicateNode.
 * @param {TypePredicateNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkTypePredicateNode(currentNode: TypePredicateNode, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.type);
}
