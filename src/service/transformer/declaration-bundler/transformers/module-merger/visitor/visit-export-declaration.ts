import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier";

export interface GenerateExportDeclarationsOptions extends Omit<ModuleMergerVisitorOptions<TS.ExportDeclaration>, "node"> {}

function generateExportDeclarations(
	options: GenerateExportDeclarationsOptions,
	exportDeclarations: TS.ExportDeclaration[] = []
): TS.ExportDeclaration[] {
	const {sourceFile, sourceFileToExportedSymbolSet, typescript} = options;
	const exportedSymbols = sourceFileToExportedSymbolSet.get(sourceFile.fileName) ?? [];
	for (const symbol of exportedSymbols) {
		// If it is a NamespaceExport, we may need to recursively add all exports for the referenced SourceFiles
		if ("isNamespaceExport" in symbol) {
			const matchingSourceFile = options.getMatchingSourceFile(symbol.moduleSpecifier, options.sourceFile.fileName);

			// If no SourceFile was matched, add the Namespace Export directly.
			if (matchingSourceFile == null) {
				exportDeclarations.push(
					typescript.createExportDeclaration(
						undefined,
						undefined,
						undefined,
						typescript.createStringLiteral(
							generateModuleSpecifier({
								...options,
								moduleSpecifier: symbol.moduleSpecifier,
								parent: options.sourceFile.fileName
							})
						)
					)
				);
			}

			// Otherwise, recursively add all exports for the reexported module
			else {
				generateExportDeclarations(
					{
						...options,
						sourceFile: matchingSourceFile
					},
					exportDeclarations
				);
			}
		}

		// Otherwise, we can just add an ExportDeclaration with an ExportSpecifier
		else {
			const exportSpecifier = typescript.createExportSpecifier(
				symbol.propertyName === symbol.name ? undefined : typescript.createIdentifier(symbol.propertyName),
				typescript.createIdentifier(symbol.name)
			);

			if (symbol.symbol != null) {
				options.nodeToOriginalSymbolMap.set(exportSpecifier.propertyName ?? exportSpecifier.name, symbol.symbol);
			}

			exportDeclarations.push(
				typescript.createExportDeclaration(
					undefined,
					undefined,
					typescript.createNamedExports([exportSpecifier]),
					symbol.moduleSpecifier == null
						? undefined
						: typescript.createStringLiteral(
								generateModuleSpecifier({
									...options,
									moduleSpecifier: symbol.moduleSpecifier,
									parent: options.sourceFile.fileName
								})
						  )
				)
			);
		}
	}
	return exportDeclarations;
}

export function visitExportDeclaration({
	node,
	typescript,
	...options
}: ModuleMergerVisitorOptions<TS.ExportDeclaration>): VisitResult<TS.ExportDeclaration> {
	const payload = {
		moduleSpecifier: node.moduleSpecifier == null || !typescript.isStringLiteralLike(node.moduleSpecifier) ? undefined : node.moduleSpecifier.text
	};

	const matchingSourceFile =
		payload.moduleSpecifier == null ? undefined : options.getMatchingSourceFile(payload.moduleSpecifier, options.sourceFile.fileName);
	const contResult = options.childContinuation(node, payload);

	// If no SourceFile was resolved, preserve the export as it is.
	if (matchingSourceFile == null) {
		return contResult;
	}

	// If it is a NamespaceExport, we'll need to add explicit named ExportSpecifiers for all of the re-exported bindings instead
	if (contResult.exportClause == null) {
		options.prependNodes(...options.includeSourceFile(matchingSourceFile));
		return generateExportDeclarations({
			...options,
			typescript,
			sourceFile: matchingSourceFile
		});
	}

	// Otherwise, preserve the continuation result, but without the ModuleSpecifier
	return typescript.updateExportDeclaration(contResult, contResult.decorators, contResult.modifiers, contResult.exportClause, undefined);
}
