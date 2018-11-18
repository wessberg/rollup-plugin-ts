import {IEvaluatorOptions} from "./i-evaluator-options";
import {Identifier} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, an Identifier
 * @param {IEvaluatorOptions<Identifier>} options
 * @returns {LiteralResult}
 */
export function evaluateIdentifier ({node, environment, context, continuation}: IEvaluatorOptions<Identifier>): LiteralResult {
	const environmentMatch = environment[node.text];
	if (environmentMatch != null) return environmentMatch;

	// Try to get a symbol for that expression and take its value declaration.
	// It may not have a symbol, for example if it is an inlined expression such as an initializer or a Block
	const symbol = context.typeChecker.getSymbolAtLocation(node);
	const valueDeclaration = symbol == null ? undefined : symbol.valueDeclaration;

	// If it has a value declaration, go forward with that one
	if (valueDeclaration != null) {
		environment[node.text] = createLiteral({value: undefined});
		const result = continuation(valueDeclaration, environment);
		// Bind to the environment
		environment[node.text] = result;
		return result;
	}

	// Otherwise, for some reason the identifier isn't statically analyzable
	return undefined;
}