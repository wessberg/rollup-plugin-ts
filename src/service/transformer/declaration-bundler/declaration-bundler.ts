import type {DeclarationBundlerOptions} from "./declaration-bundler-options.js";
import type {TS} from "../../../type/ts.js";
import {sourceFileBundler} from "./transformers/source-file-bundler/source-file-bundler.js";
import {moduleMerger} from "./transformers/module-merger/module-merger.js";
import {deconflicter} from "./transformers/deconflicter/deconflicter.js";
import {ensureDeclareModifierTransformer} from "./transformers/ensure-declare-modifier-transformer/ensure-declare-modifier-transformer.js";
import {moduleBlockExtractor} from "./transformers/module-block-extractor/module-block-extractor.js";
import {treeShaker} from "./transformers/tree-shaker/tree-shaker.js";
import {statementMerger} from "./transformers/statement-merger/statement-merger.js";
import {toExportDeclarationTransformer} from "./transformers/to-export-declaration-transformer/to-export-declaration-transformer.js";
import {ensureNoExportModifierTransformer} from "./transformers/ensure-no-export-modifier-transformer/ensure-no-export-modifier-transformer.js";
import {typeReferenceCollector} from "./transformers/type-reference-collector/type-reference-collector.js";

/**
 * Bundles declarations
 */
export function declarationBundler(options: DeclarationBundlerOptions): TS.CustomTransformers {
	return {
		afterDeclarations: [
			// Bundle all SourceFiles within the declaration bundle
			sourceFileBundler(
				options,
				// Merge modules inside the entry module(s),
				moduleBlockExtractor,

				moduleMerger(
					// Merge modules inside the entry module(s),
					moduleBlockExtractor,
					// Ensure that nodes that require it have the 'declare' modifier
					ensureDeclareModifierTransformer
				),

				// Generate ExportDeclarations where 'export' modifiers are otherwise being used
				toExportDeclarationTransformer,

				// Deconflicts bindings
				deconflicter,

				// Removes 'export' modifiers from Nodes
				ensureNoExportModifierTransformer,

				// Ensure that nodes that require it have the 'declare' modifier
				ensureDeclareModifierTransformer,

				// Tree-shake declarations
				treeShaker,

				// Merge related statements
				statementMerger({markAsModuleIfNeeded: true}),

				// Collects type references
				typeReferenceCollector
			)
		]
	};
}
