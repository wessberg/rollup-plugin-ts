import {ExpressionWithTypeArguments} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ExpressionWithTypeArguments.
 * @param {ExpressionWithTypeArguments} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkExpressionWithTypeArguments(currentNode: ExpressionWithTypeArguments, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if any of the type arguments references the Node
	if (currentNode.typeArguments != null) {
		for (const typeArgument of currentNode.typeArguments) {
			if (continuation(typeArgument)) return true;
		}
	}

	return continuation(currentNode.expression);
}
