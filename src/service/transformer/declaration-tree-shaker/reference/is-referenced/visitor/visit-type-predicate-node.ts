import {TypePredicateNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given TypePredicateNode.
 * @param {TypePredicateNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitTypePredicateNode(currentNode: TypePredicateNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.type);
}
