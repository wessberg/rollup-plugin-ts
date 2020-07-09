import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ensureNoDeclareModifierTransformer} from "../../ensure-no-declare-modifier-transformer/ensure-no-declare-modifier-transformer";
import {ensureHasDeclareModifier} from "../../../util/modifier-util";
import {generateIdentifierName} from "../../../util/generate-identifier-name";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier";
import {preserveMeta, preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta";
import {statementMerger} from "../../statement-merger/statement-merger";
import {getParentNode, setParentNode} from "../../../util/get-parent-node";

export function visitImportTypeNode(options: ModuleMergerVisitorOptions<TS.ImportTypeNode>): VisitResult<TS.ImportTypeNode> {
	const {node, compatFactory, typescript} = options;
	const moduleSpecifier = !typescript.isLiteralTypeNode(node.argument) || !typescript.isStringLiteralLike(node.argument.literal) ? undefined : node.argument.literal.text;

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
					compatFactory.updateImportTypeNode(
						contResult,
						compatFactory.createLiteralTypeNode(compatFactory.createStringLiteral(generatedModuleSpecifier)),
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
		const innerContent = compatFactory.createIdentifier(namespaceName);

		options.prependNodes(
			preserveParents(
				compatFactory.createModuleDeclaration(
					undefined,
					ensureHasDeclareModifier(undefined, compatFactory, typescript),
					compatFactory.createIdentifier(namespaceName),
					compatFactory.createModuleBlock([
						...options.includeSourceFile(matchingSourceFile, {
							allowDuplicate: true,
							lexicalEnvironment: cloneLexicalEnvironment(),
							transformers: [ensureNoDeclareModifierTransformer, statementMerger({markAsModuleIfNeeded: false})]
						})
					]),
					typescript.NodeFlags.Namespace
				),
				options
			)
		);

		returnNode = contResult.isTypeOf != null && contResult.isTypeOf ? compatFactory.createTypeQueryNode(innerContent) : innerContent;
	} else {
		options.prependNodes(...options.includeSourceFile(matchingSourceFile));

		returnNode =
			contResult.isTypeOf != null && contResult.isTypeOf
				? compatFactory.createTypeQueryNode(contResult.qualifier)
				: compatFactory.createTypeReferenceNode(contResult.qualifier, contResult.typeArguments);
	}

	preserveSymbols(returnNode, contResult.qualifier ?? contResult, options);
	setParentNode(returnNode, getParentNode(node));
	return returnNode;
}
