import {CustomTransformers} from "typescript";
import {DeclarationPreBundlerOptions} from "./declaration-pre-bundler-options";
import {trackExports} from "./track-exports/track-exports";
import {deconflicter} from "./deconflicter/deconflicter";
import {pathMappingRewriter} from "./path-mapping-rewriter/path-mapping-rewriter";
import {trackImports} from "./track-imports/track-imports";

/**
 * Custom Transformers that walks declarations before bundling
 * @param {DeclarationPreBundlerOptions} options
 * @returns {CustomTransformers}
 */
export function declarationPreBundler(options: DeclarationPreBundlerOptions): CustomTransformers {
	return {
		afterDeclarations: [
			// Resolves path mapped aliases and update module specifiers such that they point to the actual files
			pathMappingRewriter(options),
			// Deconflicts symbols across modules
			deconflicter(options),
			// Tracks imports across files such that they can be added back in if necessary at a later point
			trackImports(options),
			// Tracks exports across files such that they can be added back in if necessary at a later point
			trackExports(options)
		]
	};
}
