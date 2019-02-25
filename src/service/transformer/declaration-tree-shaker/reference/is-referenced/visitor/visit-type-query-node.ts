import {TypeQueryNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given TypeQueryNode.
 * @param {TypeQueryNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitTypeQueryNode(currentNode: TypeQueryNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.exprName);
}
