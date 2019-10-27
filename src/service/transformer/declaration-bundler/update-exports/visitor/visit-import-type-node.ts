import {
	createLiteralTypeNode,
	createStringLiteral,
	createTypeQueryNode,
	createTypeReferenceNode,
	ImportTypeNode,
	isLiteralTypeNode,
	isStringLiteralLike,
	TypeQueryNode,
	TypeReferenceNode,
	updateImportTypeNode
} from "typescript";
import {normalizeModuleSpecifier} from "../../util/module-specifier/normalize-module-specifier";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";

/**
 * Visits the given ImportTypeNode.
 * @param {UpdateExportsVisitorOptions<ImportTypeNode>} options
 * @returns {ImportTypeNode | TypeReferenceNode | TypeQueryNode | undefined}
 */
export function visitImportTypeNode({
	node,
	sourceFile,
	supportedExtensions,
	absoluteOutFileName,
	relativeOutFileName,
	chunkToOriginalFileMap
}: UpdateExportsVisitorOptions<ImportTypeNode>): ImportTypeNode | TypeReferenceNode | TypeQueryNode | undefined {
	if (!isLiteralTypeNode(node.argument) || !isStringLiteralLike(node.argument.literal)) return node;
	const specifier = node.argument.literal;

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const {isSameChunk, hasChanged, normalizedModuleSpecifier} = normalizeModuleSpecifier({
		supportedExtensions,
		specifier: specifier.text,
		sourceFile,
		chunkToOriginalFileMap,
		absoluteOutFileName,
		relativeOutFileName
	});

	// If it imports from the same chunk, only include the qualifier
	if (isSameChunk) {
		// If it doesn't import anything from the module, simply remove the ImportTypeNode.
		if (node.qualifier == null) return undefined;

		// Otherwise, create a new TypeReferenceNode that points to the qualifier itself
		return node.isTypeOf ? createTypeQueryNode(node.qualifier) : createTypeReferenceNode(node.qualifier, node.typeArguments);
	}

	// Update the ModuleSpecifier to point to the updated chunk filename, unless it didn't change at all
	else if (hasChanged) {
		return updateImportTypeNode(
			node,
			createLiteralTypeNode(createStringLiteral(normalizedModuleSpecifier)),
			node.qualifier,
			node.typeArguments,
			node.isTypeOf
		);
	}

	// Otherwise, return the node as it was
	else {
		return node;
	}
}
