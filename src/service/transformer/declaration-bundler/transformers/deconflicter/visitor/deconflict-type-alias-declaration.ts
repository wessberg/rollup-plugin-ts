import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal.js";
import {isIdentifierFree} from "../../../util/is-identifier-free.js";
import {generateUniqueBinding} from "../../../util/generate-unique-binding.js";
import {ContinuationOptions} from "../deconflicter-options.js";
import {getIdForNode} from "../../../util/get-id-for-node.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getOriginalSourceFile} from "../../../util/get-original-source-file.js";
import {isNodeInternalAlias} from "../../../util/node-util.js";

/**
 * Deconflicts the given TypeAliasDeclaration.
 */
export function deconflictTypeAliasDeclaration(options: DeconflicterVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, factory, typescript, sourceFile, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.TypeAliasDeclaration["name"];
	const id = getIdForNode(options);
	const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

	if (isIdentifierFree(lexicalEnvironment, node.name.text, originalSourceFile.fileName, isNodeInternalAlias(node, typescript))) {
		nameContResult = node.name;
		if (id != null) declarationToDeconflictedBindingMap.set(id, node.name.text);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = factory.createIdentifier(uniqueBinding);
		if (id != null) declarationToDeconflictedBindingMap.set(id, uniqueBinding);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, originalSourceFile.fileName, uniqueBinding, node.name.text);
	}

	// The Type parameters, as well as the initializer, share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult = node.typeParameters == null ? undefined : node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions));
	const typeContResult = continuation(node.type, nextContinuationOptions);

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(typeParametersContResult, node.typeParameters) && typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateTypeAliasDeclaration(node, node.modifiers, nameContResult, typeParametersContResult, typeContResult), node, options);
}
