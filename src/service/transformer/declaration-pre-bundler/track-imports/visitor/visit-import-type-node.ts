import {createIdentifier, createQualifiedName, EntityName, ImportTypeNode, isIdentifier, isLiteralTypeNode, isStringLiteralLike} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {getIdentifiersForNode} from "../../../declaration-bundler/util/get-identifiers-for-node";
import {pascalCase} from "@wessberg/stringutil";
import {stripKnownExtension} from "../../../../../util/path/path-util";
import { basename } from 'path';

/**
 * Visits the given ImportTypeNode.
 * @param {TrackImportsVisitorOptions<ImportTypeNode>} options
 * @returns {EntityName | undefined}
 */
export function visitImportTypeNode({
	node,
	sourceFile,
	resolver,
	markAsImported,
	nodeIdentifierCache,
	generateUniqueVariableName
}: TrackImportsVisitorOptions<ImportTypeNode>): EntityName | ImportTypeNode | undefined {
	if (!isLiteralTypeNode(node.argument) || !isStringLiteralLike(node.argument.literal)) return node;
	const specifier = node.argument.literal;
	const qualifier = node.qualifier;

	const originalModule = specifier == null || !isStringLiteralLike(specifier) ? sourceFile.fileName : resolver(specifier.text, sourceFile.fileName) ?? sourceFile.fileName;

	// If the node has no qualifier, it imports the entire module as a namespace.
	// Generate a name for it
	const namespaceName = generateUniqueVariableName(`${pascalCase(stripKnownExtension(basename(originalModule)))}NS`, originalModule);

	if (qualifier == null) {
		markAsImported({
			node,
			originalModule,
			namespaceImport: true,
			name: namespaceName,
			propertyName: undefined
		});
		return createIdentifier(namespaceName);
	}

	// Otherwise, take all identifiers for the EntityName that is the qualifier and mark them as imported
	else {
		const identifiers = getIdentifiersForNode({node: qualifier, resolver, sourceFile, nodeIdentifierCache});
		for (const identifier of identifiers.keys()) {
			markAsImported({
				node: qualifier,
				originalModule,
				defaultImport: false,
				name: identifier,
				propertyName: undefined
			});
		}
		return isIdentifier(qualifier) ? createIdentifier(qualifier.text) : createQualifiedName(qualifier.left, qualifier.right);
	}
}
