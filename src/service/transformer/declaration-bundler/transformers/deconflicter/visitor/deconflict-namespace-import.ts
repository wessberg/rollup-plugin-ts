import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given NamespaceImport.
 */
export function deconflictNamespaceImport(options: DeconflicterVisitorOptions<TS.NamespaceImport>): TS.NamespaceImport | undefined {
	const {node, lexicalEnvironment, typescript} = options;
	let nameContResult: TS.NamespaceImport["name"];

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
	}

	const isIdentical = nameContResult === node.name;

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(typescript.updateNamespaceImport(node, nameContResult), options);
}
