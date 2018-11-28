import {IEvaluatorOptions} from "./i-evaluator-options";
import {BindingElement, isBindingElement, isParameter} from "typescript";
import {getLexicalEnvironmentForNode, setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {performBindingElementLookup} from "../util/binding-element/perform-binding-element-lookup";
import {Continuation} from "../continuation/continuation";

/**
 * Evaluates, or attempts to evaluate, a BindingElement
 * @param {IEvaluatorOptions<BindingElement>} options
 */
export function evaluateBindingElement ({node, initialEnvironment, environment, continuation, evaluate}: IEvaluatorOptions<BindingElement>): void {
	const parentParent = node.parent.parent;

	if (isBindingElement(parentParent)) {
		return evaluate(parentParent, getLexicalEnvironmentForNode(parentParent, initialEnvironment), continuation);
	}

	else if (isParameter(parentParent)) {
		throw new Error("not implemented!");
	}

	else {
		((rightHandValueContinuation: Continuation) => {
			if (parentParent.initializer == null) return rightHandValueContinuation(undefined);
			else evaluate(parentParent.initializer, getLexicalEnvironmentForNode(parentParent, initialEnvironment), rightHandValueContinuation);
		})(rightHandValue => {

			performBindingElementLookup(node, rightHandValue, environment, evaluate, lookupResult => {
				// Bind all of the bindings to the environment
				Object.entries(lookupResult).forEach(([key, value]) => setInLexicalEnvironment(environment, key, value));
				continuation(lookupResult);
			});
		});
	}
}