import {PropertyAccessExpression} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given PropertyAccessExpression.
 * @param {PropertyAccessExpression} currentNode
 * @param {VisitorOptions} options
 */
export function visitPropertyAccessExpression(currentNode: PropertyAccessExpression, {continuation}: VisitorOptions): void {
	continuation(currentNode.expression);
}
