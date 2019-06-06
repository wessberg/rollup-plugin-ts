import {Node, SourceFile, TransformerFactory, updateSourceFileNode, visitEachChild} from "typescript";
import {IDeclarationTreeShakerOptions} from "../i-declaration-tree-shaker-options";
import {isReferenced} from "../reference/is-referenced/is-referenced";
import {ReferenceCache} from "../reference/cache/reference-cache";
import {WeakMultiMap} from "../../../../lib/multi-map/weak-multi-map";
import {mergeImports} from "../util/merge-imports/merge-imports";
import {mergeExports} from "../util/merge-exports/merge-exports";
import {normalize} from "path";

export function afterDeclarations({relativeOutFileName}: IDeclarationTreeShakerOptions): TransformerFactory<SourceFile> {
	return context => {
		return sourceFile => {
			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (normalize(sourceFile.fileName) !== normalize(relativeOutFileName)) return updateSourceFileNode(sourceFile, [], true);

			// Prepare a cache
			const cache: ReferenceCache = {
				hasReferencesCache: new WeakMap(),
				identifiersForNodeCache: new WeakMultiMap()
			};

			/**
			 * Visits the given Node
			 * @param {Node} node
			 * @returns {Node | undefined}
			 */
			function visitor(node: Node): Node | Node[] | undefined {
				if (isReferenced({node, cache})) return node;
				else {
					return undefined;
				}
			}

			const updatedSourceFile = visitEachChild(sourceFile, visitor, context);

			return updateSourceFileNode(
				updatedSourceFile,
				mergeExports(mergeImports([...updatedSourceFile.statements])),
				updatedSourceFile.isDeclarationFile,
				updatedSourceFile.referencedFiles,
				updatedSourceFile.typeReferenceDirectives,
				updatedSourceFile.hasNoDefaultLib,
				updatedSourceFile.libReferenceDirectives
			);
		};
	};
}
