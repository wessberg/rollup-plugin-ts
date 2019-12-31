import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {ContinuationOptions} from "../deconflicter-options";
import {getIdForNode} from "../../../util/get-id-for-node";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given TypeAliasDeclaration.
 */
export function deconflictTypeAliasDeclaration(options: DeconflicterVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.TypeAliasDeclaration["name"];
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

	// The Type parameters, as well as the initializer, share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null ? undefined : node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions));
	const typeContResult = continuation(node.type, nextContinuationOptions);

	const isIdentical =
		nameContResult === node.name && nodeArraysAreEqual(typeParametersContResult, node.typeParameters) && typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(
		typescript.updateTypeAliasDeclaration(node, node.decorators, node.modifiers, nameContResult, typeParametersContResult, typeContResult),
		options
	);
}
