import {isCallExpression, isIdentifier} from "typescript";
import {ICustomXDecorator} from "../i-custom-x-decorator";

/**
 * Returns true if the given decorator represents the @customAttribute decorator that can annotate classes
 * @param {ICustomXDecorator} options
 * @returns {boolean}
 */
export function isCustomXDecorator ({x, decorator}: ICustomXDecorator): boolean {
	// It must be a CallExpression, no matter what
	if (!isCallExpression(decorator.expression)) return false;
	// The expression of the CallExpression must a statically analyzable identifier
	if (!isIdentifier(decorator.expression.expression)) return false;

	// Return true if the text of the identifier is equal to the expected text
	return decorator.expression.expression.text === x;
}