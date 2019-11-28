import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {TS} from "../../../../../../../type/ts";

/**
 * Deconflicts the given BindingElement.
 */
export function deconflictBindingElement({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.BindingElement>): TS.BindingElement | undefined {
	let nameContResult: TS.BindingElement["name"];

	if (typescript.isIdentifier(node.name)) {
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
	} else {
		// Otherwise, deconflict it
		nameContResult = continuation(node.name, {lexicalEnvironment});
	}

	const propertyNameContResult =
		node.propertyName == null
			? undefined
			: typescript.isIdentifier(node.propertyName)
			? node.propertyName
			: continuation(node.propertyName, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && propertyNameContResult === node.propertyName && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return typescript.updateBindingElement(node, node.dotDotDotToken, propertyNameContResult, nameContResult, initializerContResult);
}
