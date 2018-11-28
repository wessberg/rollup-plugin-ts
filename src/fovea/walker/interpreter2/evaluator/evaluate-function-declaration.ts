import {IEvaluatorOptions} from "./i-evaluator-options";
import {FunctionDeclaration, isArrayBindingPattern, isIdentifier, isObjectBindingPattern, SyntaxKind} from "typescript";
import {LexicalEnvironment, setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {hasModifier} from "../../util/modifier/has/has-modifier";
import {IsAsyncError} from "../error/is-async-error/is-async-error";
import {Continuation} from "../continuation/continuation";
import {cpsForeach} from "../util/cps/foreach";

/**
 * Evaluates, or attempts to evaluate, a FunctionDeclaration
 * @param {IEvaluatorOptions<FunctionDeclaration>} options
 */
export function evaluateFunctionDeclaration ({node, environment, continuation, evaluate}: IEvaluatorOptions<FunctionDeclaration>): void {
	// Throw if the function is async
	if (hasModifier(node, SyntaxKind.AsyncKeyword)) {
		throw new IsAsyncError();
	}

	((evaluatedNameCallback: Continuation) => {
		if (node.name == null) return evaluatedNameCallback(undefined);
		return evaluate(node.name, environment, evaluatedNameCallback);

	})((evaluatedName) => {
		if (evaluatedName != null) {
			setInLexicalEnvironment(environment, evaluatedName, functionDeclaration.bind(functionDeclaration));
		}

		function functionDeclaration (this: Function, returnContinuation: Continuation, ...args: unknown[]) {

			// Prepare a lexical environment for the function context
			const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);

			cpsForeach(
				node.parameters
				// 'this' is a special parameter which is removed from the emitted results
					.filter(param => !(isIdentifier(param.name) && param.name.text === "this")),
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
					if (node.body == null) return returnContinuation(undefined);
					else return evaluate(node.body, localLexicalEnvironment, returnContinuation);
				}
			);
		}

		functionDeclaration.toString = () => "[WrappedFunction]";
		continuation(functionDeclaration);
	});
}