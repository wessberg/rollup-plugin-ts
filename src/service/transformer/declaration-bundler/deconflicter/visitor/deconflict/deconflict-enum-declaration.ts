import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {nodeArraysAreEqual} from "../../util/node-arrays-are-equal";
import {addBindingToLexicalEnvironment} from "../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../util/is-identifier-free";
import {generateUniqueBinding} from "../../util/generate-unique-binding";

/**
 * Deconflicts the given EnumDeclaration.
 */
export function deconflictEnumDeclaration({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration | undefined {
	let nameContResult: TS.EnumDeclaration["name"];

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

	const membersContResult = node.members.map(member => continuation(member, {lexicalEnvironment}));

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(membersContResult, node.members);

	if (isIdentical) {
		return node;
	}

	return typescript.updateEnumDeclaration(node, node.decorators, node.modifiers, nameContResult, membersContResult);
}
