import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {preserveMeta, preserveParents} from "../../../util/clone-node-with-meta.js";
import {locateExportedSymbolForSourceFile} from "../../../util/locate-exported-symbol.js";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier.js";
import {createAliasedBinding} from "../../../util/create-aliased-binding.js";
import {getAliasedDeclaration} from "../../../util/get-aliased-declaration.js";
import {ensureNonreservedWord, generateUniqueBinding} from "../../../util/generate-unique-binding.js";

export function visitExportSpecifier(options: ModuleMergerVisitorOptions<TS.ExportSpecifier>): VisitResult<TS.ExportSpecifier> {
	const {node, payload, factory} = options;

	const contResult = options.childContinuation(node, undefined);
	// Now, we might be referencing the default export from the original module, in which case this should be rewritten to point to the exact identifier
	const propertyName = contResult.propertyName ?? contResult.name;

	// If no SourceFile was resolved, preserve the export as it is.
	if (payload.moduleSpecifier == null || payload.matchingSourceFile == null) {
		return contResult;
	}

	options.prependNodes(...options.includeSourceFile(payload.matchingSourceFile));
	const useLocalBinding = options.allowExports === false;

	const namedExportedSymbol =
		propertyName.text === "default"
			? locateExportedSymbolForSourceFile({defaultExport: true}, {...options, sourceFile: payload.matchingSourceFile.fileName})
			: locateExportedSymbolForSourceFile({defaultExport: false, name: propertyName.text}, {...options, sourceFile: payload.matchingSourceFile.fileName}) ??
			  locateExportedSymbolForSourceFile({namespaceExport: true}, {...options, sourceFile: payload.matchingSourceFile.fileName});

	if (namedExportedSymbol != null) {
		// If the export exports a binding from another module *that points to a file that isn't part of the current chunk*,
		// Create a new ExportDeclaration that refers to that chunk or external module
		const generatedModuleSpecifier =
			namedExportedSymbol.moduleSpecifier == null
				? undefined
				: generateModuleSpecifier({
						...options,
						from: payload.matchingSourceFile.fileName,
						moduleSpecifier: namedExportedSymbol.moduleSpecifier
				  });

		if (
			namedExportedSymbol.moduleSpecifier != null &&
			generatedModuleSpecifier != null &&
			options.getMatchingSourceFile(namedExportedSymbol.moduleSpecifier, payload.matchingSourceFile) == null
		) {
			options.prependNodes(
				preserveParents(
					factory.createExportDeclaration(
						undefined,
						payload.isTypeOnly,
						factory.createNamedExports([
							factory.createExportSpecifier(
								false,
								propertyName.text === "default"
									? "default"
									: !("propertyName" in namedExportedSymbol) || namedExportedSymbol.propertyName == null || namedExportedSymbol.propertyName.text === contResult.name.text
									? undefined
									: factory.createIdentifier(namedExportedSymbol.propertyName.text),
								factory.createIdentifier(contResult.name.text)
							)
						]),
						factory.createStringLiteral(generatedModuleSpecifier)
					),
					options
				)
			);

			return undefined;
		} else if (useLocalBinding) {
			const safeName = generateUniqueBinding(options.lexicalEnvironment, ensureNonreservedWord(contResult.name.text));
			const declaration = getAliasedDeclaration({...options, node: contResult.name});

			if ("propertyName" in namedExportedSymbol && namedExportedSymbol.propertyName != null) {
				const safeNamedExportedSymbolPropertyName = ensureNonreservedWord(namedExportedSymbol.propertyName.text);
				if (safeNamedExportedSymbolPropertyName !== safeName) {
					options.prependNodes(
						...createAliasedBinding({
							...options,
							node: declaration,
							propertyName: safeNamedExportedSymbolPropertyName,
							name: safeName
						})
					);
				}
			}

			if (contResult.propertyName != null && contResult.propertyName.text !== contResult.name.text) {
				const safePropertyName = generateUniqueBinding(options.lexicalEnvironment, ensureNonreservedWord(contResult.propertyName.text));
				if (safePropertyName !== safeName) {
					options.prependNodes(
						...createAliasedBinding({
							...options,
							node: declaration,
							propertyName: safeName,
							name: safePropertyName
						})
					);
				}
			}

			return undefined;
		} else if (!useLocalBinding) {
			const newPropertyName =
				!("propertyName" in namedExportedSymbol) || namedExportedSymbol.propertyName == null || namedExportedSymbol.propertyName.text === contResult.name.text
					? undefined
					: ensureNonreservedWord(namedExportedSymbol.propertyName.text);

			if (newPropertyName !== contResult.propertyName?.text) {
				return preserveMeta(
					factory.updateExportSpecifier(
						contResult,
						false,
						newPropertyName == null ? undefined : factory.createIdentifier(newPropertyName),
						factory.createIdentifier(contResult.name.text)
					),
					contResult,
					options
				);
			}
		}
	}

	// Fall back to preserving the node
	return node;
}
