import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveMeta, preserveParents} from "../../../util/clone-node-with-meta";
import {locateExportedSymbolForSourceFile} from "../../../util/locate-exported-symbol";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier";

export function visitExportSpecifier(options: ModuleMergerVisitorOptions<TS.ExportSpecifier>): VisitResult<TS.ExportSpecifier> {
	const {node, payload, factory} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);

	// If no SourceFile was resolved, preserve the export as it is.
	if (payload.matchingSourceFile == null) {
		return contResult;
	}

	options.prependNodes(...options.includeSourceFile(payload.matchingSourceFile));

	// Now, we might be referencing the default export from the original module, in which case this should be rewritten to point to the exact identifier
	const propertyName = contResult.propertyName ?? contResult.name;

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
						undefined,
						false,
						factory.createNamedExports([
							factory.createExportSpecifier(
								propertyName.text === "default"
									? factory.createIdentifier("default")
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
		} else if (propertyName.text === "default") {
			return preserveMeta(
				factory.updateExportSpecifier(
					contResult,
					!("propertyName" in namedExportedSymbol) || namedExportedSymbol.propertyName == null || namedExportedSymbol.propertyName.text === contResult.name.text
						? undefined
						: factory.createIdentifier(namedExportedSymbol.propertyName.text),
					factory.createIdentifier(contResult.name.text)
				),
				contResult,
				options
			);
		}
	}

	// Fall back to preserving the node
	return node;
}
