import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {getOriginalSourceFile} from "../../../util/get-original-source-file";
import {getIdForNode} from "../../../util/get-id-for-node";

/**
 * Deconflicts the given ImportSpecifier.
 */
export function deconflictImportSpecifier(options: DeconflicterVisitorOptions<TS.ImportSpecifier>): TS.ImportSpecifier | undefined {
	const {node, lexicalEnvironment, typescript, sourceFile, declarationToDeconflictedBindingMap} = options;
	const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

	const id = getIdForNode(options);

	if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName)) {
		if (id != null) {
			declarationToDeconflictedBindingMap.set(id, node.name.text);
		}

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, node.name.text);
		return node;
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);

		if (id != null) {
			declarationToDeconflictedBindingMap.set(id, uniqueBinding);
		}

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, uniqueBinding, node.name.text);

		// If the ImportSpecifier is something like '{Foo}' but 'Foo' is already bound in this SourceFile,
		// we should re-write it to something like '{Foo as Foo$0}'
		const propertyName = node.propertyName ?? node.name;
		return preserveMeta(
			typescript.updateImportSpecifier(node, typescript.createIdentifier(propertyName.text), typescript.createIdentifier(uniqueBinding)),
			node,
			options
		);
	}
}
