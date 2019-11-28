import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {getIdentifiersForNode} from "../../../declaration-bundler/util/get-identifiers-for-node";
import {camelCase} from "@wessberg/stringutil";
import {isExternalLibrary, stripKnownExtension} from "../../../../../util/path/path-util";
import {basename, normalize} from "path";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ImportTypeNode.
 */
export function visitImportTypeNode({
	node,
	sourceFile,
	resolver,
	markAsImported,
	nodeIdentifierCache,
	typeChecker,
	typescript
}: TrackImportsVisitorOptions<TS.ImportTypeNode>): TS.EntityName | TS.ImportTypeNode | TS.TypeQueryNode | undefined {
	if (!typescript.isLiteralTypeNode(node.argument) || !typescript.isStringLiteralLike(node.argument.literal)) return node;
	const specifier = node.argument.literal;
	const qualifier = node.qualifier;

	const originalModule = normalize(
		specifier == null || !typescript.isStringLiteralLike(specifier)
			? sourceFile.fileName
			: resolver(specifier.text, sourceFile.fileName) ?? sourceFile.fileName
	);
	const rawModuleSpecifier = specifier == null || !typescript.isStringLiteralLike(specifier) ? undefined : specifier.text;

	// If the node has no qualifier, it imports the entire module as a namespace.
	// Generate a name for it
	const namespaceName = `${camelCase(stripKnownExtension(basename(originalModule)))}NS`;

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
		const innerContent = typescript.createIdentifier(namespaceName);
		return node.isTypeOf != null && node.isTypeOf ? typescript.createTypeQueryNode(innerContent) : innerContent;
	}

	// Otherwise, take all identifiers for the EntityName that is the qualifier and mark them as imported
	else {
		const identifiers = getIdentifiersForNode({node: qualifier, resolver, sourceFile, nodeIdentifierCache, typescript});
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

		const innerContent = typescript.isIdentifier(qualifier)
			? typescript.createIdentifier(qualifier.text)
			: typescript.createQualifiedName(qualifier.left, qualifier.right);
		return node.isTypeOf != null && node.isTypeOf ? typescript.createTypeQueryNode(innerContent) : innerContent;
	}
}
