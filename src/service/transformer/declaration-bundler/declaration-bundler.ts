import {CustomTransformers} from "typescript";
import {DeclarationBundlerOptions} from "./declaration-bundler-options";
import {treeShaker} from "./tree-shaker/tree-shaker";
import {modularizer} from "./modularizer/modularizer";
import {statementMerger} from "./statement-merger/statement-merger";

/**
 * Bundles declarations
 * @param {DeclarationBundlerOptions} options
 * @returns {CustomTransformers}
 */
export function declarationBundler(options: DeclarationBundlerOptions): CustomTransformers {
	return {
		afterDeclarations: [
			// Adds imports and exports to SourceFiles where necessary
			modularizer(options),

			// Tree-shakes declarations based on reference counting
			treeShaker(options),

			// Merges statements, such as Import- and ExportDeclarations
			statementMerger(options)
		]
	};
}
