import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {getOriginalSourceFile} from "../../../util/get-original-source-file";
import {getIdForNode} from "../../../util/get-id-for-node";
import { isNodeInternalAlias } from "../../../util/node-util";

/**
 * Deconflicts the given ImportClause.
 */
export function deconflictImportEqualsDeclaration(options: DeconflicterVisitorOptions<TS.ImportEqualsDeclaration>): TS.ImportEqualsDeclaration | undefined {
	const {node, lexicalEnvironment, sourceFile, typescript, factory, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.ImportClause["name"];
	const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

	const id = getIdForNode({...options});

	if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName, isNodeInternalAlias(node, typescript))) {
		nameContResult = node.name;

		if (id != null) {
			declarationToDeconflictedBindingMap.set(id, node.name.text);
		}

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = factory.createIdentifier(uniqueBinding);

		if (id != null) {
			declarationToDeconflictedBindingMap.set(id, uniqueBinding);
		}

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, uniqueBinding, node.name.text);
	}

	const isIdentical = nameContResult === node.name;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateImportEqualsDeclaration(node, node.decorators, node.modifiers, node.isTypeOnly, nameContResult, node.moduleReference), node, options);
}
