import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {getIdForNode} from "../../../util/get-id-for-node";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {getOriginalSourceFile} from "../../../util/get-original-source-file";
import {isNodeInternalAlias} from "../../../util/node-util";
import {getParentNode} from "../../../util/get-parent-node";

/**
 * Deconflicts the given VariableDeclaration.
 */
export function deconflictVariableDeclaration(options: DeconflicterVisitorOptions<TS.VariableDeclaration>): TS.VariableDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, factory, typescript, sourceFile, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.VariableDeclaration["name"];
	const variableDeclarationList = getParentNode(node);
	const upperNode = variableDeclarationList == null ? node : getParentNode(variableDeclarationList) ?? variableDeclarationList;

	if (typescript.isIdentifier(node.name)) {
		const id = getIdForNode(options);
		const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

		if (id != null) declarationToDeconflictedBindingMap.set(id, node.name.text);

		if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName, isNodeInternalAlias(upperNode, typescript))) {
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
	} else {
		// Otherwise, deconflict it
		nameContResult = continuation(node.name, {lexicalEnvironment});
	}

	const typeContResult = node.type == null ? undefined : continuation(node.type, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && typeContResult === node.type && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateVariableDeclaration(node, nameContResult, node.exclamationToken, typeContResult, initializerContResult), node, options);
}
