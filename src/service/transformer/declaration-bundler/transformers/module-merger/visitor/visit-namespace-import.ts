import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {getImportedSymbolFromNamespaceImport} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {ensureHasDeclareModifier} from "../../../util/modifier-util.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import {ensureNoDeclareModifierTransformer} from "../../ensure-no-declare-modifier-transformer/ensure-no-declare-modifier-transformer.js";
import {statementMerger} from "../../statement-merger/statement-merger.js";
import {preserveParents} from "../../../util/clone-node-with-meta.js";
import {inlineNamespaceModuleBlockTransformer} from "../../inline-namespace-module-block-transformer/inline-namespace-module-block-transformer.js";
import {NamespaceImportedSymbol} from "../../track-imports-transformer/track-imports-transformer-visitor-options.js";

export function visitNamespaceImport(options: ModuleMergerVisitorOptions<TS.NamespaceImport>): VisitResult<TS.NamespaceImport> {
	const {node, factory, typescript, payload} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);
	const importedSymbol = getImportedSymbolFromNamespaceImport(contResult, payload.moduleSpecifier) as NamespaceImportedSymbol;

	// If no SourceFile was resolved, preserve the ImportSpecifier as-is, unless it is already included in the chunk
	if (payload.matchingSourceFile == null) {
		return options.shouldPreserveImportedSymbol(importedSymbol) ? contResult : undefined;
	} else if (options.shouldPreserveImportedSymbol(importedSymbol)) {
		const existingInlinedModuleDeclarationName = options.getNameForInlinedModuleDeclaration(payload.moduleSpecifier);

		if (existingInlinedModuleDeclarationName == null) {
			const importDeclarations: TS.ImportDeclaration[] = [];
			const moduleDeclarations: TS.ModuleDeclaration[] = [];
			const moduleBlock = factory.createModuleBlock([
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
							},
							intentToAddModuleDeclaration: moduleDeclaration => {
								moduleDeclarations.push(moduleDeclaration);
							}
						})
					]
				})
			]);

			// Otherwise, prepend the nodes for the SourceFile in a namespace declaration
			options.prependNodes(
				...importDeclarations.map(importDeclaration => preserveParents(importDeclaration, options)),
				...moduleDeclarations.map(moduleDeclaration => preserveParents(moduleDeclaration, options)),
				preserveParents(
					factory.createModuleDeclaration(
						undefined,
						ensureHasDeclareModifier(undefined, factory, typescript),
						factory.createIdentifier(contResult.name.text),
						moduleBlock,
						typescript.NodeFlags.Namespace
					),
					options
				)
			);
			options.markModuleDeclarationAsInlined(payload.moduleSpecifier, contResult.name.text);
		} else {
			options.prependNodes(
				preserveParents(
					factory.createImportEqualsDeclaration(
						undefined,
						undefined,
						false,
						factory.createIdentifier(contResult.name.text),
						factory.createIdentifier(existingInlinedModuleDeclarationName)
					),
					{typescript}
				)
			);
		}
	}

	// Don't include the NamespaceImport
	return undefined;
}
