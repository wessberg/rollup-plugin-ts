import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {ContinuationOptions} from "../deconflicter-options";
import {getIdForNode} from "../../../util/get-id-for-node";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given ModuleDeclaration.
 */
export function deconflictModuleDeclaration(options: DeconflicterVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.ModuleDeclaration["name"];
	const id = getIdForNode(options);

	if (isIdentifierFree(lexicalEnvironment, node.name.text)) {
		nameContResult = node.name;
		if (id != null) declarationToDeconflictedBindingMap.set(id, node.name.text);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = typescript.createIdentifier(uniqueBinding);
		if (id != null) declarationToDeconflictedBindingMap.set(id, uniqueBinding);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, uniqueBinding, node.name.text);
	}

	// The body has its own lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nameContResult === node.name && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(typescript.updateModuleDeclaration(node, node.decorators, node.modifiers, nameContResult, bodyContResult), options);
}
