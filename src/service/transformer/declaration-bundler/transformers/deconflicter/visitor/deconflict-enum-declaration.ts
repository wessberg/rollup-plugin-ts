import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal.js";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment.js";
import {isIdentifierFree} from "../../../util/is-identifier-free.js";
import {generateUniqueBinding} from "../../../util/generate-unique-binding.js";
import {TS} from "../../../../../../type/ts.js";
import {getIdForNode} from "../../../util/get-id-for-node.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getOriginalSourceFile} from "../../../util/get-original-source-file.js";

/**
 * Deconflicts the given EnumDeclaration.
 */
export function deconflictEnumDeclaration(options: DeconflicterVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript, sourceFile, factory, declarationToDeconflictedBindingMap} = options;
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
		nameContResult = factory.createIdentifier(uniqueBinding);
		if (id != null) declarationToDeconflictedBindingMap.set(id, uniqueBinding);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, uniqueBinding, node.name.text);
	}

	const membersContResult = node.members.map(member => continuation(member, {lexicalEnvironment}));

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(membersContResult, node.members);

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateEnumDeclaration(node, node.decorators, node.modifiers, nameContResult, membersContResult), node, options);
}
