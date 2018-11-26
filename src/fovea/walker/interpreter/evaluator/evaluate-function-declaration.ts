import {IEvaluatorOptions} from "./i-evaluator-options";
import {FunctionDeclaration, isArrayBindingPattern, isIdentifier, isObjectBindingPattern, isReturnStatement, SyntaxKind} from "typescript";
import {LexicalEnvironment, setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {Literal} from "../literal/literal";
import {isNodeArray} from "../../util/node-array/is-node-array";
import {hasModifier} from "../../util/modifier/has/has-modifier";
import {EvaluateFailureKind} from "../evaluate-failure";

/**
 * Evaluates, or attempts to evaluate, a FunctionDeclaration
 * @param {IEvaluatorOptions<FunctionDeclaration>} options
 * @returns {Literal}
 */
export function evaluateFunctionDeclaration ({node, environment, continuation, continuationFactory}: IEvaluatorOptions<FunctionDeclaration>): Literal {
	// Throw if the function is async
	if (hasModifier(node, SyntaxKind.AsyncKeyword)) {
		throw new Error(EvaluateFailureKind.IS_ASYNC);
	}

	const evaluatedName = node.name == null ? undefined : continuation.run(node.name, environment);
	if (evaluatedName != null) {
		setInLexicalEnvironment(environment, evaluatedName, evaluatedFunction.bind(evaluatedFunction));
	}

	function evaluatedFunction (this: Function, ...args: unknown[]) {

		// Prepare a lexical environment for the function context
		const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);

		node.parameters
		// 'this' is a special parameter which is removed from the emitted results
			.filter(param => !(isIdentifier(param.name) && param.name.text === "this"))
			.map((param, index) => {
				if (isIdentifier(param.name)) {

					console.log("param:", index, param.getText(), args);

					setInLexicalEnvironment(
						localLexicalEnvironment,
						param.name.text,
						args[index] == null && param.initializer != null
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

		if (node.body == null) return undefined;

		const localContinuation = continuationFactory.create(localNode => !isNodeArray(localNode) && isReturnStatement(localNode));
		return localContinuation.run(node.body, localLexicalEnvironment);
	}

	try {
		evaluatedFunction.toString = () => node.getText();
	} catch {
		evaluatedFunction.toString = () => `[Function${evaluatedName == null ? "" : ` ${evaluatedName}`}]`;
	}
	return evaluatedFunction;
}