import {IEvaluatorOptions} from "./i-evaluator-options";
import {isPropertyAssignment, ObjectLiteralExpression} from "typescript";
import {Literal} from "../literal/literal";
import {cpsForeach} from "../util/cps/foreach";

/**
 * Evaluates, or attempts to evaluate, a ObjectLiteralExpression
 * @param {IEvaluatorOptions<ObjectLiteralExpression>} options
 */
export function evaluateObjectLiteralExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<ObjectLiteralExpression>): void {
	const value: { [key: string]: Literal["value"] } = {};

	cpsForeach(
		node.properties,
		(property, _, next) => {

			if (isPropertyAssignment(property)) {
				evaluate(property.initializer, environment, initializerLiteral => {
					evaluate(property.name, environment, nameLiteral => {
						if (nameLiteral != null) {
							value[nameLiteral] = initializerLiteral;
						}
						next();
					});
				});
			}

			throw new Error("not implemented");
		},
		() => continuation(value)
	);
}