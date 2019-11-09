import {
	createIdentifier,
	createQualifiedName,
	createTypeQueryNode,
	EntityName,
	ImportTypeNode,
	isIdentifier,
	isLiteralTypeNode,
	isStringLiteralLike,
	TypeQueryNode
} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {getIdentifiersForNode} from "../../../declaration-bundler/util/get-identifiers-for-node";
import {pascalCase} from "@wessberg/stringutil";
import {isExternalLibrary, stripKnownExtension} from "../../../../../util/path/path-util";
import {basename} from "path";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";

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
	generateUniqueVariableName,
	typeChecker
}: TrackImportsVisitorOptions<ImportTypeNode>): EntityName | ImportTypeNode | TypeQueryNode | undefined {
	if (!isLiteralTypeNode(node.argument) || !isStringLiteralLike(node.argument.literal)) return node;
	const specifier = node.argument.literal;
	const qualifier = node.qualifier;

	const originalModule =
		specifier == null || !isStringLiteralLike(specifier) ? sourceFile.fileName : resolver(specifier.text, sourceFile.fileName) ?? sourceFile.fileName;
	const rawModuleSpecifier = specifier == null || !isStringLiteralLike(specifier) ? undefined : specifier.text;

	// If the node has no qualifier, it imports the entire module as a namespace.
	// Generate a name for it
	const namespaceName = generateUniqueVariableName(`${pascalCase(stripKnownExtension(basename(originalModule)))}NS`, originalModule);

	if (qualifier == null) {
		markAsImported({
			node,
			originalModule,
			rawModuleSpecifier,
			isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
			namespaceImport: true,
			name: namespaceName,
			propertyName: undefined
		});
		const innerContent = createIdentifier(namespaceName);
		return node.isTypeOf ? createTypeQueryNode(innerContent) : innerContent;
	}

	// Otherwise, take all identifiers for the EntityName that is the qualifier and mark them as imported
	else {
		const identifiers = getIdentifiersForNode({node: qualifier, resolver, sourceFile, nodeIdentifierCache});
		const declaration = getAliasedDeclaration(qualifier, typeChecker);
		for (const identifier of identifiers.keys()) {
			markAsImported({
				node: declaration ?? qualifier,
				originalModule,
				rawModuleSpecifier,
				isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
				defaultImport: false,
				name: identifier,
				propertyName: undefined
			});
		}

		const innerContent = isIdentifier(qualifier) ? createIdentifier(qualifier.text) : createQualifiedName(qualifier.left, qualifier.right);
		return node.isTypeOf ? createTypeQueryNode(innerContent) : innerContent;
	}
}
