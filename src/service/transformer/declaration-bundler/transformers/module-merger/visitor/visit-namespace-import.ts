import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {getImportedSymbolFromNamespaceImport} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {ensureHasDeclareModifier} from "../../../util/modifier-util";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ensureNoDeclareModifierTransformer} from "../../ensure-no-declare-modifier-transformer/ensure-no-declare-modifier-transformer";
import {statementMerger} from "../../statement-merger/statement-merger";
import {preserveParents} from "../../../util/clone-node-with-meta";
import {inlineNamespaceModuleBlockTransformer} from "../../inline-namespace-module-block-transformer/inline-namespace-module-block-transformer";

export function visitNamespaceImport(options: ModuleMergerVisitorOptions<TS.NamespaceImport>): VisitResult<TS.NamespaceImport> {
	const {node, compatFactory, typescript, payload} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);

	// If no SourceFile was resolved, preserve the ImportSpecifier as-is, unless it is already included in the chunk
	if (payload.matchingSourceFile == null) {
		return options.shouldPreserveImportedSymbol(getImportedSymbolFromNamespaceImport(contResult, payload.moduleSpecifier)) ? contResult : undefined;
	}

	const importDeclarations: TS.ImportDeclaration[] = [];
	const moduleBlock = compatFactory.createModuleBlock([
		...options.includeSourceFile(payload.matchingSourceFile, {
			allowDuplicate: true,
			allowExports: "skip-optional",
			lexicalEnvironment: cloneLexicalEnvironment(),
			transformers: [
				ensureNoDeclareModifierTransformer,
				statementMerger({markAsModuleIfNeeded: false}),
				inlineNamespaceModuleBlockTransformer({
					intentToAddImportDeclaration: importDeclaration => {
						importDeclarations.push(importDeclaration);
					}
				})
			]
		})
	]);

	// Otherwise, prepend the nodes for the SourceFile in a namespace declaration
	options.prependNodes(
		...importDeclarations.map(importDeclaration => preserveParents(importDeclaration, options)),
		preserveParents(
			compatFactory.createModuleDeclaration(
				undefined,
				ensureHasDeclareModifier(undefined, compatFactory, typescript),
				compatFactory.createIdentifier(contResult.name.text),
				moduleBlock,
				typescript.NodeFlags.Namespace
			),
			options
		)
	);

	// Don't include the NamespaceImport
	return undefined;
}
