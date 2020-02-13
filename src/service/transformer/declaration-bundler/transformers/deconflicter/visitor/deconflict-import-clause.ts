import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {getOriginalSourceFile} from "../../../util/get-original-source-file";

/**
 * Deconflicts the given ImportClause.
 */
export function deconflictImportClause(options: DeconflicterVisitorOptions<TS.ImportClause>): TS.ImportClause | undefined {
	const {node, continuation, lexicalEnvironment, sourceFile, typescript} = options;
	let nameContResult: TS.ImportClause["name"];
	const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

	if (node.name != null) {
		if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName)) {
			nameContResult = node.name;

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, node.name.text);
		} else {
			// Otherwise, deconflict it
			const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
			nameContResult = typescript.createIdentifier(uniqueBinding);

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, uniqueBinding, node.name.text);
		}
	}

	const namedBindingsContResult = node.namedBindings == null ? undefined : continuation(node.namedBindings, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && namedBindingsContResult === node.namedBindings;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(typescript.updateImportClause(node, nameContResult, namedBindingsContResult), node, options);
}
