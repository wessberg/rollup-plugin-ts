import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {getImportedSymbolFromImportClauseName} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {preserveMeta, preserveParents} from "../../../util/clone-node-with-meta.js";
import {createAliasedBinding} from "../../../util/create-aliased-binding.js";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier.js";
import {locateExportedSymbolForSourceFile} from "../../../util/locate-exported-symbol.js";
import {getAliasedDeclaration} from "../../../util/get-aliased-declaration.js";
import {ensureNonreservedWord} from "../../../util/generate-unique-binding.js";

export function visitImportClause(options: ModuleMergerVisitorOptions<TS.ImportClause>): VisitResult<TS.ImportClause> {
	const {node, payload, factory, typescript} = options;
	// If there is no moduleSpecifier, proceed from the children.
	if (payload.moduleSpecifier == null) return options.childContinuation(node, payload);
	const contResult = options.childContinuation(node, payload);

	if (node.name == null || contResult.name == null) {
		// If there is no name, just return the continuation result. We only concern ourselves with default imports here
		return contResult;
	}

	// If no SourceFile was resolved, preserve the ImportClause, but potentially remove the default import
	if (payload.matchingSourceFile == null) {
		// If the default import should be preserved, return the continuation result
		if (options.shouldPreserveImportedSymbol(getImportedSymbolFromImportClauseName(contResult.name, payload.moduleSpecifier))) {
			return contResult;
		}

		// Otherwise, remove the default import and remove the named bindings that was retrieved from the continuation.
		return preserveMeta(factory.updateImportClause(contResult, contResult.isTypeOnly, undefined, contResult.namedBindings), contResult, options);
	}

	// Otherwise, prepend the nodes for the SourceFile
	options.prependNodes(...options.includeSourceFile(payload.matchingSourceFile));

	// Now, take the default export for the referenced module
	const defaultExportedSymbol = locateExportedSymbolForSourceFile({defaultExport: true}, {...options, sourceFile: payload.matchingSourceFile.fileName});

	if (defaultExportedSymbol != null) {
		// If the default export exports a binding from another module *that points to a file that isn't part of the current chunk*,
		// Create a new ImportDeclaration that refers to that chunk or external module
		const generatedModuleSpecifier =
			defaultExportedSymbol.moduleSpecifier == null
				? undefined
				: generateModuleSpecifier({
						...options,
						from: payload.matchingSourceFile.fileName,
						moduleSpecifier: defaultExportedSymbol.moduleSpecifier
				  });
		if (
			defaultExportedSymbol.moduleSpecifier != null &&
			generatedModuleSpecifier != null &&
			options.getMatchingSourceFile(defaultExportedSymbol.moduleSpecifier, payload.matchingSourceFile) == null
		) {
			options.prependNodes(
				preserveParents(
					factory.createImportDeclaration(
						undefined,
						undefined,
						factory.createImportClause(false, factory.createIdentifier(contResult.name.text), undefined),
						factory.createStringLiteral(generatedModuleSpecifier)
					),
					{typescript}
				)
			);
		}

		// Otherwise, if the names of the ImportClause and the default export exactly matches, we don't need to do anything.
		// If they don't, we'll need to alias it
		else if (defaultExportedSymbol.propertyName.text !== contResult.name.text) {
			const declaration = getAliasedDeclaration({...options, node: contResult.name});
			const safePropertyName = ensureNonreservedWord(defaultExportedSymbol.propertyName.text);

			options.prependNodes(
				...createAliasedBinding({
					...options,
					node: declaration,
					propertyName: safePropertyName,
					name: contResult.name.text
				})
			);
		}
	}

	// Don't include the ImportClause
	return undefined;
}
