import {CustomTransformers, isExportDeclaration, isImportDeclaration, Node, SourceFile, TransformerFactory, visitEachChild} from "typescript";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {hasExportModifier} from "./util/util";
import {visitNodeWithExportModifier} from "./visitor/visit-node-with-export-modifier";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {IReferenceCache} from "./cache/i-reference-cache";
import {WeakMultiMap} from "../../../lib/multi-map/weak-multi-map";
import {IDeclarationTransformersOptions} from "./i-declaration-transformers-options";

/**
 * The implementation of the transformer
 * @param {IDeclarationTransformersOptions} options
 * @returns {TransformerFactory<SourceFile>}
 */
function transformerImplementation({usedExports, ...rest}: IDeclarationTransformersOptions): TransformerFactory<SourceFile> {
	return context => sourceFile => {
		// Prepare a cache
		const cache: IReferenceCache = {
			hasReferencesCache: new WeakMap(),
			referencingNodesCache: new WeakMultiMap(),
			identifiersForNodeCache: new WeakMultiMap()
		};

		// Prepare some VisitorOptions
		const visitorOptions = {
			usedExports,
			sourceFile,
			cache,
			...rest
		};

		/**
		 * Visits the given Node
		 * @param {Node} node
		 * @returns {Node | undefined}
		 */
		function visitor(node: Node): Node | undefined {
			if (isImportDeclaration(node)) return visitImportDeclaration({node, ...visitorOptions});
			else if (isExportDeclaration(node)) return visitExportDeclaration({node, ...visitorOptions});
			else if (hasExportModifier(node)) return visitNodeWithExportModifier({node, ...visitorOptions});
			return node;
		}

		return visitEachChild(sourceFile, visitor, context);
	};
}

/**
 * Will transform declaration files
 * @param {IDeclarationTransformersOptions} options
 * @returns {CustomTransformers}
 */
export function declarationTransformers(options: IDeclarationTransformersOptions): CustomTransformers {
	return {
		afterDeclarations: [transformerImplementation(options)]
	};
}
