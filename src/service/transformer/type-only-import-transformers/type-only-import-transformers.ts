import {
	createImportDeclaration,
	createLiteral,
	CustomTransformers,
	ExportDeclaration,
	ImportDeclaration,
	isExportDeclaration,
	isImportDeclaration,
	isStringLiteralLike,
	Node,
	SourceFile,
	TransformationContext,
	Transformer,
	updateSourceFileNode,
	visitEachChild
} from "typescript";
import {isExternalLibrary} from "../../../util/path/path-util";

/**
 * Adds a module specifier to the given map
 * @param {string} parent
 * @param {string} id
 * @param {Map<string, Set<string>>} map
 */
function addPreTranspileImportedOrExportedModuleSpecifier(parent: string, id: string, map: Map<string, Set<string>>): void {
	let existingSet = map.get(parent);
	if (existingSet == null) {
		existingSet = new Set();
		map.set(parent, existingSet);
	}
	existingSet.add(id);
}

/**
 * Gets transformers that will track which imports are being stripped when .js transpilation is finished and then re-add them
 * to make Rollup track those files as well
 * @returns {CustomTransformers}
 */
export function getTypeOnlyImportTransformers(): CustomTransformers {
	const preTranspileImportedModuleSpecifiers: Map<string, Set<string>> = new Map();

	/**
	 * Visits the given node before transpilation
	 * @param {Node} node
	 * @returns {Node | undefined}
	 */
	function visitNodeBefore(node: Node): Node {
		if (isImportDeclaration(node)) return visitImportDeclarationBefore(node);
		else if (isExportDeclaration(node)) return visitExportDeclarationBefore(node);
		return node;
	}

	/**
	 * Visits the given ImportDeclaration before transpilation
	 * @param {ImportDeclaration} importDeclaration
	 * @returns {ImportDeclaration | undefined}
	 */
	function visitImportDeclarationBefore(importDeclaration: ImportDeclaration): ImportDeclaration {
		if (!isStringLiteralLike(importDeclaration.moduleSpecifier) || importDeclaration.getSourceFile() == null) return importDeclaration;

		addPreTranspileImportedOrExportedModuleSpecifier(importDeclaration.getSourceFile().fileName, importDeclaration.moduleSpecifier.text, preTranspileImportedModuleSpecifiers);
		return importDeclaration;
	}

	/**
	 * Visits the given ExportDeclaration before transpilation
	 * @param {ExportDeclaration} exportDeclaration
	 * @returns {ExportDeclaration | undefined}
	 */
	function visitExportDeclarationBefore(exportDeclaration: ExportDeclaration): ExportDeclaration {
		if (exportDeclaration.moduleSpecifier == null || !isStringLiteralLike(exportDeclaration.moduleSpecifier) || exportDeclaration.getSourceFile() == null) return exportDeclaration;

		addPreTranspileImportedOrExportedModuleSpecifier(exportDeclaration.getSourceFile().fileName, exportDeclaration.moduleSpecifier.text, preTranspileImportedModuleSpecifiers);
		return exportDeclaration;
	}

	return {
		before: [
			(context: TransformationContext): Transformer<SourceFile> => sourceFile => {
				return visitEachChild(sourceFile, visitNodeBefore, context);
			}
		],
		after: [
			(context: TransformationContext): Transformer<SourceFile> => sourceFile => {
				const postTranspileImportedOrExportedModuleSpecifiers: Set<string> = new Set();

				/**
				 * Visits the given node after transpilation
				 * @param {Node} node
				 * @returns {Node | undefined}
				 */
				function visitNodeAfter(node: Node): Node {
					if (isImportDeclaration(node)) return visitImportDeclarationAfter(node);
					else if (isExportDeclaration(node)) return visitExportDeclarationAfter(node);
					return node;
				}

				/**
				 * Visits the given ImportDeclaration after transpilation
				 * @param {ImportDeclaration} importDeclaration
				 * @returns {ImportDeclaration | undefined}
				 */
				function visitImportDeclarationAfter(importDeclaration: ImportDeclaration): ImportDeclaration {
					if (!isStringLiteralLike(importDeclaration.moduleSpecifier)) return importDeclaration;
					postTranspileImportedOrExportedModuleSpecifiers.add(importDeclaration.moduleSpecifier.text);
					return importDeclaration;
				}

				/**
				 * Visits the given ExportDeclaration after transpilation
				 * @param {ExportDeclaration} exportDeclaration
				 * @returns {ExportDeclaration | undefined}
				 */
				function visitExportDeclarationAfter(exportDeclaration: ExportDeclaration): ExportDeclaration {
					if (exportDeclaration.moduleSpecifier == null || !isStringLiteralLike(exportDeclaration.moduleSpecifier)) return exportDeclaration;
					postTranspileImportedOrExportedModuleSpecifiers.add(exportDeclaration.moduleSpecifier.text);
					return exportDeclaration;
				}

				const newSourceFile = visitEachChild(sourceFile, visitNodeAfter, context);
				const preTranspileSet = preTranspileImportedModuleSpecifiers.get(sourceFile.fileName);
				const typeOnlyImports = [...(preTranspileSet == null ? [] : preTranspileSet)].filter(
					preTranspileFileName => !postTranspileImportedOrExportedModuleSpecifiers.has(preTranspileFileName) && !isExternalLibrary(preTranspileFileName)
				);

				if (typeOnlyImports.length < 1) {
					return newSourceFile;
				} else {
					return updateSourceFileNode(sourceFile, [
						...typeOnlyImports.map(typeOnlyImport => createImportDeclaration(undefined, undefined, undefined, createLiteral(typeOnlyImport))),
						...sourceFile.statements
					]);
				}
			}
		]
	};
}
