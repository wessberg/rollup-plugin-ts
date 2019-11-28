import {DeclarationBundlerOptions} from "./declaration-bundler-options";
import {TS} from "../../../../type/ts";
import {sourceFileBundler} from "./transformers/source-file-bundler/source-file-bundler";
import {moduleMerger} from "./transformers/module-merger/module-merger";
import {deconflicter} from "./transformers/deconflicter/deconflicter";
import {modifierFinalizer} from "./transformers/modifier-finalizer/modifier-finalizer";
import {moduleBlockExtractor} from "./transformers/module-block-extractor/module-block-extractor";
import {treeShaker} from "./transformers/tree-shaker/tree-shaker";
import {statementMerger} from "./transformers/statement-merger/statement-merger";

/**
 * Bundles declarations
 */
export function declarationBundler(options: DeclarationBundlerOptions): TS.CustomTransformers {
	return {
		afterDeclarations: [
			// Bundle all SourceFiles within the declaration bundle
			sourceFileBundler(
				options,
				// Merge modules inside the entry module(s)
				moduleMerger(
					moduleBlockExtractor,
					// Deconflicts bindings inside merged modules
					deconflicter,
					// Removes 'export' modifiers from Nodes and instead prefer ExportDeclarations
					// Also ensures that 'declare' modifiers exist where needed
					modifierFinalizer
				),
				// Move the inner block inside of the outer ModuleDeclaration(s) out into the root scope
				moduleBlockExtractor,

				// Tree-shake declarations
				treeShaker,

				// Merge related statements
				statementMerger
			)
		]
	};
}
