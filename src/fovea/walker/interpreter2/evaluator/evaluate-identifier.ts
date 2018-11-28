import {IEvaluatorOptions} from "./i-evaluator-options";
import {Identifier, Node} from "typescript";
import {getFromLexicalEnvironment, getLexicalEnvironmentForNode, setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {isLeftHandIdentifier} from "../../util/identifier/is-left-hand-identifier";

/**
 * Evaluates, or attempts to evaluate, an Identifier
 * @param {IEvaluatorOptions<Identifier>} options
 */
export function evaluateIdentifier ({node, initialEnvironment, environment, continuation, context, evaluate}: IEvaluatorOptions<Identifier>): void {

	// If the identifier is a left-hand expression such as a PropertyAssignment, we're not interested in what it
	// resolves to, but rather its textual value
	if (isLeftHandIdentifier(node)) {
		// return the identifier name
		return continuation(node.text);
	}

	// Otherwise, try to resolve it. Maybe it exists in the environment already?
	const environmentMatch = getFromLexicalEnvironment(environment, node.text);
	if (environmentMatch != null) {
		console.log({"node.text": node.text, environmentMatch});
		// Return the existing evaluated value from the environment
		return continuation(environmentMatch);
	}
	else {
		// Initialize the environmental binding
		setInLexicalEnvironment(environment, node.text, undefined);
	}

	// Try to get a symbol for whatever the identifier points to and take its value declaration.
	// It may not have a symbol, for example if it is an inlined expression such as an initializer or a Block
	const symbol = context.typeChecker.getSymbolAtLocation(node);
	const valueDeclaration: Node|undefined = symbol == null ? undefined : symbol.valueDeclaration;

	// If it has a value declaration, go forward with that one
	if (valueDeclaration != null) {

		// Get the lexical environment for the matched node. Its' closure may be entirely different
		const environmentForValueDeclaration = getLexicalEnvironmentForNode(valueDeclaration, initialEnvironment.env);

		evaluate(valueDeclaration, environmentForValueDeclaration, result => {
			const value = getFromLexicalEnvironment(environmentForValueDeclaration, node.text) != null
				? getFromLexicalEnvironment(environmentForValueDeclaration, node.text)
				: result == null ? result : result[node.text];

			setInLexicalEnvironment(environment, node.text, value);

			// Return the computed value
			continuation(value);
		});
	}
}