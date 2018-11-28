import {IEvaluatorOptions} from "./i-evaluator-options";
import {ArrowFunction, isArrayBindingPattern, isIdentifier, isObjectBindingPattern, isReturnStatement, SyntaxKind} from "typescript";
import {LexicalEnvironment, setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {Literal} from "../literal/literal";
import {isNodeArray} from "../../util/node-array/is-node-array";
import {hasModifier} from "../../util/modifier/has/has-modifier";
import {EvaluateFailureKind} from "../evaluate-failure";

/**
 * Evaluates, or attempts to evaluate, an ArrowFunction
 * @param {IEvaluatorOptions<ArrowFunction>} options
 * @returns {Literal}
 */
export function evaluateArrowFunctionExpression ({node, environment, continuation, continuationFactory}: IEvaluatorOptions<ArrowFunction>): Literal {

	// Throw if the function is async
	if (hasModifier(node, SyntaxKind.AsyncKeyword)) {
		throw new SyntaxError(EvaluateFailureKind.IS_ASYNC);
	}

	const returnValue = (...args: unknown[]) => {

		// Prepare a lexical environment for the function context
		const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);

		node.parameters.map((param, index) => {
			if (isIdentifier(param.name)) {
				setInLexicalEnvironment(
					localLexicalEnvironment,
					param.name.text, args[index] == null && param.initializer != null
						? continuation.run(param.initializer, environment)
						: args[index],
					true);
			}

			else if (isObjectBindingPattern(param.name)) {
				throw new Error("not implemented");
			}

			else if (isArrayBindingPattern(param.name)) {
				throw new Error("not implemented");
			}
		});

		const localContinuation = continuationFactory.create(localNode => !isNodeArray(localNode) && isReturnStatement(localNode));
		return localContinuation.run(node.body, localLexicalEnvironment);
	};

	try {
		returnValue.toString = () => node.getText();
	} catch {
		returnValue.toString = () => "[Function]";
	}
	return returnValue;
}