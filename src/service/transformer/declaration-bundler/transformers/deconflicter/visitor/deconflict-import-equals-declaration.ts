import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment.js";
import {isIdentifierFree} from "../../../util/is-identifier-free.js";
import {generateUniqueBinding} from "../../../util/generate-unique-binding.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getOriginalSourceFile} from "../../../util/get-original-source-file.js";
import {getIdForNode} from "../../../util/get-id-for-node.js";
import {isNodeInternalAlias} from "../../../util/node-util.js";

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

	return preserveMeta(factory.updateImportEqualsDeclaration(node, node.modifiers, node.isTypeOnly, nameContResult, node.moduleReference), node, options);
}
