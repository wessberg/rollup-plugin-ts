import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier";
import {getSymbolAtLocation} from "../../../util/get-symbol-at-location";

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
			const matchingSourceFile = options.getMatchingSourceFile(symbol.moduleSpecifier);

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
								moduleSpecifier: symbol.moduleSpecifier
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
				symbol.propertyName.text === symbol.name.text ? undefined : typescript.createIdentifier(symbol.propertyName.text),
				typescript.createIdentifier(symbol.name.text)
			);

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
									moduleSpecifier: symbol.moduleSpecifier
								})
						  )
				)
			);
			const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
			options.nodeToOriginalSymbolMap.set(propertyName, getSymbolAtLocation({...options, node: symbol.propertyName ?? symbol.name}));
		}
	}
	return exportDeclarations;
}

export function visitExportDeclaration(options: ModuleMergerVisitorOptions<TS.ExportDeclaration>): VisitResult<TS.ExportDeclaration> {
	const {node, typescript} = options;
	const moduleSpecifier =
		node.moduleSpecifier == null || !typescript.isStringLiteralLike(node.moduleSpecifier) ? undefined : node.moduleSpecifier.text;
	const updatedModuleSpecifier =
		moduleSpecifier == null
			? undefined
			: generateModuleSpecifier({
					...options,
					moduleSpecifier
			  });

	const matchingSourceFile = moduleSpecifier == null ? undefined : options.getMatchingSourceFile(moduleSpecifier);

	const payload = {
		moduleSpecifier,
		matchingSourceFile
	};

	const contResult = options.childContinuation(node, payload);

	// If no SourceFile was resolved
	if (matchingSourceFile == null) {
		// If the module specifier didn't change, preserve the export as it is.
		if (moduleSpecifier === updatedModuleSpecifier || updatedModuleSpecifier == null) {
			return contResult;
		}

		// Otherwise, update the module specifier
		return typescript.updateExportDeclaration(
			contResult,
			contResult.decorators,
			contResult.modifiers,
			contResult.exportClause,
			typescript.createStringLiteral(updatedModuleSpecifier)
		);
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
