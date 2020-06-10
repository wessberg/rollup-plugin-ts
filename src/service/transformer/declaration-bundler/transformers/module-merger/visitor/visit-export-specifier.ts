import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveMeta, preserveParents} from "../../../util/clone-node-with-meta";
import {locateExportedSymbolForSourceFile} from "../../../util/locate-exported-symbol";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier";

export function visitExportSpecifier(options: ModuleMergerVisitorOptions<TS.ExportSpecifier>): VisitResult<TS.ExportSpecifier> {
	const {node, payload, typescript} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);

	// If no SourceFile was resolved, preserve the export as it is.
	if (payload.matchingSourceFile == null) {
		return contResult;
	}

	options.prependNodes(...options.includeSourceFile(payload.matchingSourceFile));

	// Now, we might be referencing the default export from the original module, in which case this should be rewritten to point to the exact identifier
	const propertyName = contResult.propertyName ?? contResult.name;

	const exportedSymbol =
		propertyName.text === "default"
			? locateExportedSymbolForSourceFile({defaultExport: true}, {...options, sourceFile: payload.matchingSourceFile.fileName})
			: locateExportedSymbolForSourceFile({defaultExport: false, name: propertyName.text}, {...options, sourceFile: payload.matchingSourceFile.fileName});

	if (exportedSymbol != null) {
		// If the export exports a binding from another module *that points to a file that isn't part of the current chunk*,
		// Create a new ExportDeclaration that refers to that chunk or external module
		const generatedModuleSpecifier =
			exportedSymbol.moduleSpecifier == null
				? undefined
				: generateModuleSpecifier({
						...options,
						from: payload.matchingSourceFile.fileName,
						moduleSpecifier: exportedSymbol.moduleSpecifier
				  });
		if (
			exportedSymbol.moduleSpecifier != null &&
			generatedModuleSpecifier != null &&
			options.getMatchingSourceFile(exportedSymbol.moduleSpecifier, payload.matchingSourceFile) == null
		) {
			options.prependNodes(
				preserveParents(
					typescript.createExportDeclaration(
						undefined,
						undefined,
						typescript.createNamedExports([
							typescript.createExportSpecifier(
								propertyName.text === "default"
									? typescript.createIdentifier("default")
									: exportedSymbol.propertyName.text === contResult.name.text
									? undefined
									: typescript.createIdentifier(exportedSymbol.propertyName.text),
								typescript.createIdentifier(contResult.name.text)
							)
						]),
						typescript.createStringLiteral(generatedModuleSpecifier)
					),
					options
				)
			);

			return undefined;
		} else if (propertyName.text === "default") {
			return preserveMeta(
				typescript.updateExportSpecifier(
					contResult,
					exportedSymbol.propertyName.text === contResult.name.text ? undefined : typescript.createIdentifier(exportedSymbol.propertyName.text),
					typescript.createIdentifier(contResult.name.text)
				),
				contResult,
				options
			);
		}
	}

	// Fall back to preserving the node
	return node;
}
