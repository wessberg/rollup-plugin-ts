import {ExpressionWithTypeArguments} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ExpressionWithTypeArguments.
 * @param {ExpressionWithTypeArguments} currentNode
 * @param {VisitorOptions} options
 */
export function visitExpressionWithTypeArguments(currentNode: ExpressionWithTypeArguments, {continuation}: VisitorOptions): void {
	// Check if any of the type arguments references the Node
	if (currentNode.typeArguments != null) {
		for (const typeArgument of currentNode.typeArguments) {
			continuation(typeArgument);
		}
	}

	continuation(currentNode.expression);
}
