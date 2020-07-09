import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {TS} from "../../../../../../type/ts";
import {getIdForNode} from "../../../util/get-id-for-node";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {getOriginalSourceFile} from "../../../util/get-original-source-file";

/**
 * Deconflicts the given EnumDeclaration.
 */
export function deconflictEnumDeclaration(options: DeconflicterVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript, sourceFile, compatFactory, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.EnumDeclaration["name"];
	const id = getIdForNode(options);
	const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

	if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName)) {
		nameContResult = node.name;
		if (id != null) declarationToDeconflictedBindingMap.set(id, node.name.text);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = compatFactory.createIdentifier(uniqueBinding);
		if (id != null) declarationToDeconflictedBindingMap.set(id, uniqueBinding);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, uniqueBinding, node.name.text);
	}

	const membersContResult = node.members.map(member => continuation(member, {lexicalEnvironment}));

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(membersContResult, node.members);

	if (isIdentical) {
		return node;
	}

	return preserveMeta(compatFactory.updateEnumDeclaration(node, node.decorators, node.modifiers, nameContResult, membersContResult), node, options);
}
