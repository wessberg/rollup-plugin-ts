import {PropertyAccessExpression} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given PropertyAccessExpression.
 * @param {PropertyAccessExpression} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkPropertyAccessExpression(currentNode: PropertyAccessExpression, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.expression);
}
