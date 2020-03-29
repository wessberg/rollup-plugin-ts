import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {getOriginalSourceFile} from "../../../util/get-original-source-file";
import {getIdForNode} from "../../../util/get-id-for-node";

/**
 * Deconflicts the given NamespaceImport.
 */
export function deconflictNamespaceImport(options: DeconflicterVisitorOptions<TS.NamespaceImport>): TS.NamespaceImport | undefined {
	const {node, lexicalEnvironment, sourceFile, typescript, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.NamespaceImport["name"];
	const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

	const id = getIdForNode(options);

	if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName)) {
		nameContResult = node.name;

		if (id != null) {
			declarationToDeconflictedBindingMap.set(id, node.name.text);
		}

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = typescript.createIdentifier(uniqueBinding);

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

	return preserveMeta(typescript.updateNamespaceImport(node, nameContResult), node, options);
}
