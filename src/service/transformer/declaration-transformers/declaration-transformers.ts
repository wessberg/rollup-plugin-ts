import {CustomTransformers, isExportDeclaration, isImportDeclaration, Node, SourceFile, TransformerFactory, visitEachChild} from "typescript";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {hasExportModifier} from "./util/util";
import {visitNodeWithExportModifier} from "./visitor/visit-node-with-export-modifier";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {IReferenceCache} from "./cache/i-reference-cache";
import {WeakMultiMap} from "../../../lib/multi-map/weak-multi-map";

/**
 * The implementation of the transformer
 * @param {Set<string>} usedExports
 * @returns {TransformerFactory<SourceFile>}
 */
function transformerImplementation (usedExports: Set<string>): TransformerFactory<SourceFile> {
	return context => sourceFile => {
		// Prepare a cache
		const cache: IReferenceCache = {
			hasReferencesCache: new WeakMap(),
			referencingNodesCache: new WeakMultiMap(),
			identifiersForNodeCache: new WeakMultiMap()
		};
		console.log("declarations for:", sourceFile.fileName);

		/**
		 * Visits the given Node
		 * @param {Node} node
		 * @returns {Node | undefined}
		 */
		function visitor (node: Node): Node|undefined {
			if (isImportDeclaration(node)) return visitImportDeclaration(node, usedExports, sourceFile, cache);
			else if (isExportDeclaration(node)) return visitExportDeclaration(node, usedExports);
			else if (hasExportModifier(node)) return visitNodeWithExportModifier(node, usedExports, sourceFile, cache);
			return node;
		}

		return visitEachChild(sourceFile, visitor, context);
	};
}

/**
 * Will transform declaration files
 * @param {Set<string>} usedExports
 * @returns {CustomTransformers}
 */
export function declarationTransformers (
	usedExports: Set<string>
): CustomTransformers {

	return {
		afterDeclarations: [
			transformerImplementation(usedExports)
		]
	};
}