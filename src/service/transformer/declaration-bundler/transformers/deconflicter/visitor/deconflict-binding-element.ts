import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment.js";
import {isIdentifierFree} from "../../../util/is-identifier-free.js";
import {generateUniqueBinding} from "../../../util/generate-unique-binding.js";
import {TS} from "../../../../../../type/ts.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getOriginalSourceFile} from "../../../util/get-original-source-file.js";

/**
 * Deconflicts the given BindingElement.
 */
export function deconflictBindingElement(options: DeconflicterVisitorOptions<TS.BindingElement>): TS.BindingElement | undefined {
	const {node, continuation, lexicalEnvironment, typescript, factory, sourceFile} = options;

	let nameContResult: TS.BindingElement["name"];
	const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

	if (typescript.isIdentifier(node.name)) {
		if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName)) {
			nameContResult = node.name;

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, node.name.text);
		} else {
			// Otherwise, deconflict it
			const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
			nameContResult = factory.createIdentifier(uniqueBinding);

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, uniqueBinding, node.name.text);
		}
	} else {
		// Otherwise, deconflict it
		nameContResult = continuation(node.name, {lexicalEnvironment});
	}

	const propertyNameContResult =
		node.propertyName == null ? undefined : typescript.isIdentifier(node.propertyName) ? node.propertyName : continuation(node.propertyName, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && propertyNameContResult === node.propertyName && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateBindingElement(node, node.dotDotDotToken, propertyNameContResult, nameContResult, initializerContResult), node, options);
}
