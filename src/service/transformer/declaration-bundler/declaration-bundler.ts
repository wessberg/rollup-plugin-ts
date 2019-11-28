import {DeclarationBundlerOptions} from "./declaration-bundler-options";
import {treeShaker} from "./tree-shaker/tree-shaker";
import {modularizer} from "./modularizer/modularizer";
import {statementMerger} from "./statement-merger/statement-merger";
import {TS} from "../../../type/ts";
import {deconflicter} from "./deconflicter/deconflicter";

/**
 * Bundles declarations
 */
export function declarationBundler(options: DeclarationBundlerOptions): TS.CustomTransformers {
	return {
		afterDeclarations: [
			// Adds imports and exports to SourceFiles where necessary
			modularizer(options),

			// Tree-shakes declarations based on reference counting
			treeShaker(options),

			// Deconflicts bindings across modules inside the same chunk
			deconflicter(options),

			// Merges statements, such as Import- and ExportDeclarations
			statementMerger(options)
		]
	};
}
