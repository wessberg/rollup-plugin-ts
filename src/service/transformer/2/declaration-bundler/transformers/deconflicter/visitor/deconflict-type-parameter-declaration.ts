import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";

/**
 * Deconflicts the given TypeParameterDeclaration.
 */
export function deconflictTypeParameterDeclaration({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.TypeParameterDeclaration>): TS.TypeParameterDeclaration | undefined {
	let nameContResult: TS.TypeParameterDeclaration["name"];

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

	const constraintContResult = node.constraint == null ? undefined : continuation(node.constraint, {lexicalEnvironment});
	const defaultContResult = node.default == null ? undefined : continuation(node.default, {lexicalEnvironment});

	const isIdentical = constraintContResult === node.constraint && defaultContResult === node.default;

	if (isIdentical) {
		return node;
	}

	return typescript.updateTypeParameterDeclaration(node, nameContResult, constraintContResult, defaultContResult);
}
