import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment.js";
import {isIdentifierFree} from "../../../util/is-identifier-free.js";
import {generateUniqueBinding} from "../../../util/generate-unique-binding.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getOriginalSourceFile} from "../../../util/get-original-source-file.js";
import {getIdForNode} from "../../../util/get-id-for-node.js";

/**
 * Deconflicts the given ImportSpecifier.
 */
export function deconflictImportSpecifier(options: DeconflicterVisitorOptions<TS.ImportSpecifier>): TS.ImportSpecifier | undefined {
	const {node, lexicalEnvironment, typescript, factory, sourceFile, declarationToDeconflictedBindingMap} = options;
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
		return preserveMeta(factory.updateImportSpecifier(node, false, factory.createIdentifier(propertyName.text), factory.createIdentifier(uniqueBinding)), node, options);
	}
}
