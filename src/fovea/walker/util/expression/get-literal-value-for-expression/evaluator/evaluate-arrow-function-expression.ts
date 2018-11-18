import {IEvaluatorOptions} from "./i-evaluator-options";
import {ArrowFunction, isArrayBindingPattern, isIdentifier, isObjectBindingPattern} from "typescript";
import {createLiteral, Literal} from "../../../literal/literal";
import {LexicalEnvironment} from "../../../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../../../lexical-environment/clone-lexical-environment";

/**
 * Evaluates, or attempts to evaluate, an ArrowFunction
 * @param {IEvaluatorOptions<ArrowFunction>} options
 * @returns {Literal}
 */
export function evaluateArrowFunctionExpression ({node, environment, continuation}: IEvaluatorOptions<ArrowFunction>): Literal {
	// Prepare a lexical environment for the function context
	const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment({...environment});

	return createLiteral({
		value: (...args: unknown[]) => {
			node.parameters.map((param, index) => {
				if (isIdentifier(param.name)) {
					localLexicalEnvironment[param.name.text] = createLiteral({value: args[index]});
				}

				else if (isObjectBindingPattern(param.name)) {
					throw new Error("not implemented");
				}

				else if (isArrayBindingPattern(param.name)) {
					throw new Error("not implemented");
				}
			});

			return continuation(node.body, localLexicalEnvironment);
		}
	});
}