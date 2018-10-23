import {createImportDeclaration, createLiteral, CustomTransformers, ImportDeclaration, isImportDeclaration, isStringLiteralLike, Node, SourceFile, TransformationContext, Transformer, updateSourceFileNode, visitEachChild} from "typescript";
import {isExternalLibrary} from "../../util/path/path-util";

/**
 * Adds a module specifier to the given map
 * @param {string} parent
 * @param {string} id
 * @param {Map<string, Set<string>>} map
 */
function addPreTranspileImportedModuleSpecifier (parent: string, id: string, map: Map<string, Set<string>>): void {
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
export function getTypeOnlyImportTransformers (): CustomTransformers {
	const preTranspileImportedModuleSpecifiers: Map<string, Set<string>> = new Map();

	/**
	 * Visits the given node before transpilation
	 * @param {Node} node
	 * @returns {Node | undefined}
	 */
	function visitNodeBefore (node: Node): Node|undefined {
		if (isImportDeclaration(node)) return visitImportDeclarationBefore(node);
		return node;
	}

	/**
	 * Visits the given ImportDeclaration before transpilation
	 * @param {ImportDeclaration} importDeclaration
	 * @returns {ImportDeclaration | undefined}
	 */
	function visitImportDeclarationBefore (importDeclaration: ImportDeclaration): ImportDeclaration|undefined {
		if (!isStringLiteralLike(importDeclaration.moduleSpecifier)) return importDeclaration;

		addPreTranspileImportedModuleSpecifier(
			importDeclaration.getSourceFile().fileName,
			importDeclaration.moduleSpecifier.text,
			preTranspileImportedModuleSpecifiers
		);
		return importDeclaration;
	}

	return {
		before: [
			(context: TransformationContext): Transformer<SourceFile> => sourceFile => visitEachChild(sourceFile, visitNodeBefore, context)
		],
		after: [
			(context: TransformationContext): Transformer<SourceFile> => sourceFile => {
				const postTranspileImportedModuleSpecifiers: Set<string> = new Set();

				/**
				 * Visits the given node after transpilation
				 * @param {Node} node
				 * @returns {Node | undefined}
				 */
				function visitNodeAfter (node: Node): Node|undefined {
					if (isImportDeclaration(node)) return visitImportDeclarationAfter(node);
					return node;
				}

				/**
				 * Visits the given ImportDeclaration after transpilation
				 * @param {ImportDeclaration} importDeclaration
				 * @returns {ImportDeclaration | undefined}
				 */
				function visitImportDeclarationAfter (importDeclaration: ImportDeclaration): ImportDeclaration|undefined {
					if (!isStringLiteralLike(importDeclaration.moduleSpecifier)) return importDeclaration;
					postTranspileImportedModuleSpecifiers.add(importDeclaration.moduleSpecifier.text);
					return importDeclaration;
				}

				const newSourceFile = visitEachChild(sourceFile, visitNodeAfter, context);
				const preTranspileSet = preTranspileImportedModuleSpecifiers.get(sourceFile.fileName);
				const typeOnlyImports = [...(preTranspileSet == null ? [] : preTranspileSet)]
					.filter(preTranspileFileName => !postTranspileImportedModuleSpecifiers.has(preTranspileFileName) && !isExternalLibrary(preTranspileFileName));

				if (typeOnlyImports.length < 1) {
					return newSourceFile;
				} else {

					return updateSourceFileNode(sourceFile, [
						...typeOnlyImports.map(typeOnlyImport => createImportDeclaration(
							undefined,
							undefined,
							undefined,
							createLiteral(typeOnlyImport)
						)), ...sourceFile.statements
					]);
				}
			}
		]
	};
}