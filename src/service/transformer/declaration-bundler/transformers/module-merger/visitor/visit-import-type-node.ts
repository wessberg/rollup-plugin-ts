import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ensureNoDeclareModifierTransformer} from "../../ensure-no-declare-modifier-transformer/ensure-no-declare-modifier-transformer";
import {ensureHasDeclareModifier} from "../../../util/modifier-util";
import {generateIdentifierName} from "../../../util/generate-identifier-name";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier";
import {preserveMeta, preserveSymbols} from "../../../util/clone-node-with-meta";

export function visitImportTypeNode(options: ModuleMergerVisitorOptions<TS.ImportTypeNode>): VisitResult<TS.ImportTypeNode> {
	const {node} = options;
	const moduleSpecifier =
		!options.typescript.isLiteralTypeNode(node.argument) || !options.typescript.isStringLiteralLike(node.argument.literal)
			? undefined
			: node.argument.literal.text;

	const matchingSourceFile = moduleSpecifier == null ? undefined : options.getMatchingSourceFile(moduleSpecifier, options.sourceFile);
	const payload = {
		moduleSpecifier,
		matchingSourceFile
	};

	if (payload.moduleSpecifier == null) return options.childContinuation(node, payload);
	const contResult = options.childContinuation(node, payload);

	// If no SourceFile was resolved, preserve the export as it is.
	if (matchingSourceFile == null) {
		const generatedModuleSpecifier =
			moduleSpecifier == null
				? undefined
				: generateModuleSpecifier({
						...options,
						from: options.sourceFile.fileName,
						moduleSpecifier
				  });
		return generatedModuleSpecifier == null
			? contResult
			: preserveMeta(
					options.typescript.updateImportTypeNode(
						contResult,
						options.typescript.createLiteralTypeNode(options.typescript.createStringLiteral(generatedModuleSpecifier)),
						contResult.qualifier,
						contResult.typeArguments,
						contResult.isTypeOf
					),
					node,
					options
			  );
	}

	let returnNode: TS.TypeQueryNode | TS.TypeReferenceNode | TS.Identifier | TS.QualifiedName;

	// If the node has no qualifier, it imports the entire module as a namespace.
	if (contResult.qualifier == null) {
		// Generate a name for it
		const namespaceName = generateIdentifierName(matchingSourceFile.fileName, "namespace");
		const innerContent = options.typescript.createIdentifier(namespaceName);

		options.prependNodes(
			options.typescript.createModuleDeclaration(
				undefined,
				ensureHasDeclareModifier(undefined, options.typescript),
				options.typescript.createIdentifier(namespaceName),
				options.typescript.createModuleBlock([
					...options.includeSourceFile(matchingSourceFile, {
						allowDuplicate: true,
						lexicalEnvironment: cloneLexicalEnvironment(),
						transformers: [ensureNoDeclareModifierTransformer]
					})
				]),
				options.typescript.NodeFlags.Namespace
			)
		);

		returnNode = contResult.isTypeOf != null && contResult.isTypeOf ? options.typescript.createTypeQueryNode(innerContent) : innerContent;
	} else {
		options.prependNodes(...options.includeSourceFile(matchingSourceFile));

		returnNode =
			contResult.isTypeOf != null && contResult.isTypeOf
				? options.typescript.createTypeQueryNode(contResult.qualifier)
				: options.typescript.createTypeReferenceNode(contResult.qualifier, contResult.typeArguments);
	}

	preserveSymbols(returnNode, contResult.qualifier ?? contResult, options);
	return returnNode;
}
