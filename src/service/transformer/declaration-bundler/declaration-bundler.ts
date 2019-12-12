import {DeclarationBundlerOptions} from "./declaration-bundler-options";
import {TS} from "../../../type/ts";
import {sourceFileBundler} from "./transformers/source-file-bundler/source-file-bundler";
import {moduleMerger} from "./transformers/module-merger/module-merger";
import {deconflicter} from "./transformers/deconflicter/deconflicter";
import {ensureDeclareModifierTransformer} from "./transformers/ensure-declare-modifier-transformer/ensure-declare-modifier-transformer";
import {moduleBlockExtractor} from "./transformers/module-block-extractor/module-block-extractor";
import {treeShaker} from "./transformers/tree-shaker/tree-shaker";
import {statementMerger} from "./transformers/statement-merger/statement-merger";
import {toExportDeclarationTransformer} from "./transformers/to-export-declaration-transformer/to-export-declaration-transformer";
import {noExportDeclarationTransformer} from "./transformers/no-export-declaration-transformer/no-export-declaration-transformer";
import {ensureNoExportModifierTransformer} from "./transformers/ensure-no-export-modifier-transformer/ensure-no-export-modifier-transformer";
import {trackExportsTransformer} from "./transformers/track-exports-transformer/track-exports-transformer";

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
					// Tracks export modifiers and ExportDeclarations
					trackExportsTransformer,
					// Removes 'export' modifiers from Nodes
					ensureNoExportModifierTransformer,
					// Removes ExportDeclarations and ExportAssignments
					noExportDeclarationTransformer,
					// Ensure that nodes that require it have the 'declare' modifier
					ensureDeclareModifierTransformer
				),

				// Tracks export modifiers and ExportDeclarations
				trackExportsTransformer,

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
				statementMerger
			)
		]
	};
}
