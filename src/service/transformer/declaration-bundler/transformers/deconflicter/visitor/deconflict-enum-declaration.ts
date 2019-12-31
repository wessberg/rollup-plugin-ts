import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {TS} from "../../../../../../type/ts";
import {getIdForNode} from "../../../util/get-id-for-node";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given EnumDeclaration.
 */
export function deconflictEnumDeclaration(options: DeconflicterVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.EnumDeclaration["name"];
	const id = getIdForNode(options);

	if (isIdentifierFree(lexicalEnvironment, node.name.text)) {
		nameContResult = node.name;
		if (id != null) declarationToDeconflictedBindingMap.set(id, node.name.text);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = typescript.createIdentifier(uniqueBinding);
		if (id != null) declarationToDeconflictedBindingMap.set(id, uniqueBinding);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, uniqueBinding, node.name.text);
	}

	const membersContResult = node.members.map(member => continuation(member, {lexicalEnvironment}));

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(membersContResult, node.members);

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(typescript.updateEnumDeclaration(node, node.decorators, node.modifiers, nameContResult, membersContResult), options);
}
