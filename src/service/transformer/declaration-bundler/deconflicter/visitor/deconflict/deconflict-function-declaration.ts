import {ContinuationOptions, DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../util/node-arrays-are-equal";
import {addBindingToLexicalEnvironment} from "../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../util/is-identifier-free";
import {generateUniqueBinding} from "../../util/generate-unique-binding";

/**
 * Deconflicts the given FunctionDeclaration.
 */
export function deconflictFunctionDeclaration({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration | undefined {
	let nameContResult: TS.FunctionDeclaration["name"];

	if (node.name != null) {
		if (isIdentifierFree(lexicalEnvironment, node.name.text)) {
			nameContResult = node.name;

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, node.name.text);
		} else {
			// Otherwise, deconflict it
			const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
			nameContResult = typescript.createIdentifier(uniqueBinding);

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, uniqueBinding, node.name.text);
		}
	}

	// The body, type, type parameters, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null ? undefined : node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions));
	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical =
		nameContResult === node.name &&
		nodeArraysAreEqual(typeParametersContResult, node.typeParameters) &&
		nodeArraysAreEqual(parametersContResult, node.parameters) &&
		typeContResult === node.type &&
		bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return typescript.updateFunctionDeclaration(
		node,
		node.decorators,
		node.modifiers,
		node.asteriskToken,
		nameContResult,
		typeParametersContResult,
		parametersContResult,
		typeContResult,
		bodyContResult
	);
}
