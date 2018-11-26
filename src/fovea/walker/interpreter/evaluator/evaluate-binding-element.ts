import {IEvaluatorOptions} from "./i-evaluator-options";
import {BindingElement, SyntaxKind} from "typescript";
import {performBindingElementLookup} from "../../util/binding-element/perform-binding-element-lookup";
import {getLexicalEnvironmentForNode, setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a BindingElement
 * @param {IEvaluatorOptions<BindingElement>} options
 * @returns {Literal}
 */
export function evaluateBindingElement ({node, initialEnvironment, environment, continuation}: IEvaluatorOptions<BindingElement>): Literal {
	const parentParent = node.parent.parent;
	let rightHandValue: Literal;
	switch (parentParent.kind) {
		case SyntaxKind.VariableDeclaration: {
			if (parentParent.initializer == null) {
				rightHandValue = undefined;
			}

			else {
				rightHandValue = continuation.run(parentParent.initializer, getLexicalEnvironmentForNode(parentParent, initialEnvironment));
			}
			break;
		}

		case SyntaxKind.BindingElement: {
			return continuation.run(parentParent, getLexicalEnvironmentForNode(parentParent, initialEnvironment));
		}

		case SyntaxKind.Parameter:
			throw new Error("not implemented!");
	}

	const lookupResult = performBindingElementLookup(node, rightHandValue, environment, continuation);
	// Bind all of the bindings to the environment
	Object.entries(lookupResult).forEach(([key, value]) => setInLexicalEnvironment(environment, key, value));
	return lookupResult;
}