import {IEvaluatorOptions} from "./i-evaluator-options";
import {ObjectLiteralExpression, SyntaxKind} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ObjectLiteralExpression
 * @param {IEvaluatorOptions<ObjectLiteralExpression>} options
 * @returns {Literal}
 */
export function evaluateObjectLiteralExpression ({node, continuation, environment}: IEvaluatorOptions<ObjectLiteralExpression>): Literal {
	const value: {[key: string]: Literal["value"]} = {};

	for (const property of node.properties) {

		switch (property.kind) {
			case SyntaxKind.PropertyAssignment: {
				// Continue from the initializer
				const initializerLiteral = continuation.run(property.initializer, environment);

				// Now, get the assignment name
				const nameLiteral = continuation.run(property.name, environment);

				if (nameLiteral != null) {
					value[nameLiteral] = initializerLiteral;
				}
				break;
			}

			default:
				throw new Error("Not implemented");
		}
	}

	// Return the Object Literal as the evaluated value
	return value;
}