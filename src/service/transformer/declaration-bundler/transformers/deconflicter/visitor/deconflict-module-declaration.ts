import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment.js";
import {isIdentifierFree} from "../../../util/is-identifier-free.js";
import {generateUniqueBinding} from "../../../util/generate-unique-binding.js";
import {ContinuationOptions} from "../deconflicter-options.js";
import {getIdForNode} from "../../../util/get-id-for-node.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getOriginalSourceFile} from "../../../util/get-original-source-file.js";
import {getBindingFromLexicalEnvironment} from "../../../util/get-binding-from-lexical-environment.js";
import {isNodeInternalAlias} from "../../../util/node-util.js";

/**
 * Deconflicts the given ModuleDeclaration.
 */
export function deconflictModuleDeclaration(options: DeconflicterVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, factory, typescript, sourceFile, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.ModuleDeclaration["name"];
	const id = getIdForNode(options);
	const originalSourceFile = getOriginalSourceFile(node.name, sourceFile, typescript);

	// Check if it is a namespace ModuleDeclaration. If it is, its name can be deconflicted. If it isn't, it should augment and merge with any existing declarations for it
	const isNamespace = (node.flags & typescript.NodeFlags.Namespace) !== 0;
	if (!isNamespace) {
		const binding = getBindingFromLexicalEnvironment(lexicalEnvironment, node.name.text) ?? node.name.text;

		// The body has its own lexical environment
		const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};
		const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

		const isIdentical = binding === node.name.text && bodyContResult === node.body;

		if (isIdentical) {
			return node;
		} else {
			return preserveMeta(factory.updateModuleDeclaration(node, node.decorators, node.modifiers, factory.createIdentifier(binding), bodyContResult), node, options);
		}
	}

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

	// The body has its own lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nameContResult === node.name && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateModuleDeclaration(node, node.decorators, node.modifiers, nameContResult, bodyContResult), node, options);
}
