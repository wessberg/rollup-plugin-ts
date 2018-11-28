import {IEvaluatorOptions} from "./i-evaluator-options";
import {ArrowFunction, isArrayBindingPattern, isIdentifier, isObjectBindingPattern, SyntaxKind} from "typescript";
import {LexicalEnvironment, setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {hasModifier} from "../../util/modifier/has/has-modifier";
import {IsAsyncError} from "../error/is-async-error/is-async-error";
import {cpsForeach} from "../util/cps/foreach";
import {Continuation} from "../continuation/continuation";

/**
 * Evaluates, or attempts to evaluate, an ArrowFunction
 * @param {IEvaluatorOptions<ArrowFunction>} options
 */
export function evaluateArrowFunctionExpression ({node, environment, continuation, evaluate}: IEvaluatorOptions<ArrowFunction>): void {

	// Throw if the function is async
	if (hasModifier(node, SyntaxKind.AsyncKeyword)) {
		throw new IsAsyncError();
	}

	const arrowFunctionExpression = (returnContinuation: Continuation, ...args: unknown[]) => {

		// Prepare a lexical environment for the function context
		const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);

		cpsForeach(
			node.parameters,
			(param, index, next) => {
				const name = param.name;
				if (isIdentifier(name)) {
					if (args[index] == null && param.initializer != null) {
						evaluate(param.initializer, environment, result => {
							setInLexicalEnvironment(localLexicalEnvironment, name.text, result, true);
							next();
						});
					}
					else {
						setInLexicalEnvironment(localLexicalEnvironment, name.text, args[index], true);
						next();
					}
				}

				else if (isObjectBindingPattern(param.name)) {
					throw new Error("not implemented");
				}

				else if (isArrayBindingPattern(param.name)) {
					throw new Error("not implemented");
				}
			},
			() => {
				evaluate(node.body, localLexicalEnvironment, returnContinuation);
			}
		);
	};

	arrowFunctionExpression.toString = () => "[WrappedFunction]";
	continuation(arrowFunctionExpression);
}