import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {stripKnownExtension} from "../../../../../../../util/path/path-util";
import {basename} from "path";
import {camelCase} from "@wessberg/stringutil";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ensureHasDeclareModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitImportTypeNode({node, ...options}: ModuleMergerVisitorOptions<TS.ImportTypeNode>): VisitResult<TS.ImportTypeNode> {
	const payload = {
		moduleSpecifier:
			!options.typescript.isLiteralTypeNode(node.argument) || !options.typescript.isStringLiteralLike(node.argument.literal)
				? undefined
				: node.argument.literal.text
	};

	if (payload.moduleSpecifier == null) return options.childContinuation(node, payload);

	const matchingSourceFile = options.getMatchingSourceFile(payload.moduleSpecifier, options.sourceFile.fileName);
	const contResult = options.childContinuation(node, payload);

	// If no SourceFile was resolved, preserve the export as it is.
	if (matchingSourceFile == null) {
		return contResult;
	}

	// If the node has no qualifier, it imports the entire module as a namespace.
	if (node.qualifier == null) {
		// Generate a name for it
		const namespaceName = `${camelCase(stripKnownExtension(basename(matchingSourceFile.fileName)))}NS`;
		const innerContent = options.typescript.createIdentifier(namespaceName);

		options.prependNodes(
			options.typescript.createModuleDeclaration(
				undefined,
				ensureHasDeclareModifier(undefined, options.typescript),
				options.typescript.createIdentifier(namespaceName),
				options.typescript.createModuleBlock([
					...options.includeSourceFile(matchingSourceFile, {allowDuplicate: true, lexicalEnvironment: cloneLexicalEnvironment()})
				]),
				options.typescript.NodeFlags.Namespace
			)
		);

		return node.isTypeOf != null && node.isTypeOf ? options.typescript.createTypeQueryNode(innerContent) : innerContent;
	} else {
		const innerContent = options.typescript.isIdentifier(node.qualifier)
			? options.typescript.createIdentifier(node.qualifier.text)
			: options.typescript.createQualifiedName(node.qualifier.left, node.qualifier.right);

		options.prependNodes(...options.includeSourceFile(matchingSourceFile));

		return node.isTypeOf != null && node.isTypeOf ? options.typescript.createTypeQueryNode(innerContent) : innerContent;
	}
}
