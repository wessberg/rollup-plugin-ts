import {CustomTransformers} from "typescript";
import {DeclarationBundlerOptions} from "./declaration-bundler-options";
import {treeShaker} from "./tree-shaker/tree-shaker";

/**
 * Bundles declarations
 * @param {DeclarationBundlerOptions} options
 * @returns {CustomTransformers}
 */
export function declarationBundler(options: DeclarationBundlerOptions): CustomTransformers {
	return {
		afterDeclarations: [
			// Tree-shakes declarations based on reference counting
			treeShaker(options)
		]
	};
}
