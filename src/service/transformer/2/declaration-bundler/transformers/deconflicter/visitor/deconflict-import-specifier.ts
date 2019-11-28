import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";

/**
 * Deconflicts the given ImportSpecifier.
 */
export function deconflictImportSpecifier({
	node,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.ImportSpecifier>): TS.ImportSpecifier | undefined {
	let nameContResult: TS.EnumDeclaration["name"];

	if (isIdentifierFree(lexicalEnvironment, node.name.text)) {
		nameContResult = node.name;

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = typescript.createIdentifier(uniqueBinding);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, uniqueBinding, node.name.text);

		// If the ImportSpecifier is something like '{Foo}' but 'Foo' is already bound in this SourceFile,
		// we should re-write it to something like '{Foo as Foo$0}'
		if (node.propertyName == null) {
			return typescript.updateImportSpecifier(node, typescript.createIdentifier(node.name.text), typescript.createIdentifier(uniqueBinding));
		}
	}

	const isIdentical = nameContResult === node.name;

	if (isIdentical) {
		return node;
	}

	// If the ImportSpecifier is something like '{Foo as Bar}' but 'Bar' is already bound in this SourceFile,
	// we should re-write it to something like '{Foo as Bar$0}'
	return typescript.updateImportSpecifier(node, node.propertyName, nameContResult);
}
