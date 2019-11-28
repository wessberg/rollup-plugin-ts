import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";

/**
 * Deconflicts the given ImportClause.
 */
export function deconflictImportClause({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.ImportClause>): TS.ImportClause | undefined {
	let nameContResult: TS.ImportClause["name"];

	if (node.name != null) {
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
	}

	const namedBindingsContResult = node.namedBindings == null ? undefined : continuation(node.namedBindings, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && namedBindingsContResult === node.namedBindings;

	if (isIdentical) {
		return node;
	}

	return typescript.updateImportClause(node, nameContResult, namedBindingsContResult);
}
