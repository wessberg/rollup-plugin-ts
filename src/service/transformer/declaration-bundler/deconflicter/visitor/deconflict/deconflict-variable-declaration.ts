import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../util/is-identifier-free";
import {generateUniqueBinding} from "../../util/generate-unique-binding";

/**
 * Deconflicts the given VariableDeclaration.
 */
export function deconflictVariableDeclaration({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.VariableDeclaration>): TS.VariableDeclaration | undefined {
	let nameContResult: TS.VariableDeclaration["name"];

	if (typescript.isIdentifier(node.name)) {
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
	} else {
		// Otherwise, deconflict it
		nameContResult = continuation(node.name, {lexicalEnvironment});
	}

	const typeContResult = node.type == null ? undefined : continuation(node.type, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = typeContResult === node.type && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return typescript.updateVariableDeclaration(node, nameContResult, typeContResult, initializerContResult);
}
