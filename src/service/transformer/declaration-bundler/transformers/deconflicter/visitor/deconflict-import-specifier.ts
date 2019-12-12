import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given ImportSpecifier.
 */
export function deconflictImportSpecifier(options: DeconflicterVisitorOptions<TS.ImportSpecifier>): TS.ImportSpecifier | undefined {
	const {node, lexicalEnvironment, typescript} = options;

	if (isIdentifierFree(lexicalEnvironment, node.name.text)) {
		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, node.name.text);
		return node;
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, uniqueBinding, node.name.text);

		// If the ImportSpecifier is something like '{Foo}' but 'Foo' is already bound in this SourceFile,
		// we should re-write it to something like '{Foo as Foo$0}'
		const propertyName = node.propertyName ?? node.name;
		return preserveSymbols(
			typescript.updateImportSpecifier(node, typescript.createIdentifier(propertyName.text), typescript.createIdentifier(uniqueBinding)),
			options
		);
	}
}
