import {isIdentifier, isParenthesizedExpression, isPropertyAccessExpression, isTypeAssertion, Node} from "typescript";

/**
 * Gets the path to "dot" into an object with based on the node. For example, if the node is a simple identifier, say, 'foo', the dot path is simply "foo".
 * And, if it is a PropertyAccessExpression, that path may be "console.log" for example
 * @param {T} node
 * @returns {Identifier | undefined}
 */
export function getDotPathFromNode<T extends Node> (node: T): string|undefined {
	if (isIdentifier(node)) {
		return node.text;
	}
	else if (isParenthesizedExpression(node)) {
		return getDotPathFromNode(node.expression);
	}
	else if (isTypeAssertion(node)) {
		return getDotPathFromNode(node.expression);
	}

	else if (isPropertyAccessExpression(node)) {
		const leftHand = getDotPathFromNode(node.expression);
		const rightHand = getDotPathFromNode(node.name);
		if (leftHand == null || rightHand == null) return undefined;
		return `${leftHand}.${rightHand}`;
	}
	return undefined;
}