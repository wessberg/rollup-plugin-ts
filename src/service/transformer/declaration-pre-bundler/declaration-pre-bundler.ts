import {DeclarationPreBundlerOptions} from "./declaration-pre-bundler-options";
import {trackExports} from "./track-exports/track-exports";
import {pathMappingRewriter} from "./path-mapping-rewriter/path-mapping-rewriter";
import {trackImports} from "./track-imports/track-imports";
import {TS} from "../../../type/ts";
import {trackLocals} from "./track-locals/track-locals";

/**
 * Custom Transformers that walks declarations before bundling
 */
export function declarationPreBundler(options: DeclarationPreBundlerOptions): TS.CustomTransformers {
	return {
		afterDeclarations: [
			// Resolves path mapped aliases and update module specifiers such that they point to the actual files
			pathMappingRewriter(options),
			// Tracks local bindings across modules
			trackLocals(options),
			// Tracks imports across files such that they can be added back in if necessary at a later point
			trackImports(options),
			// Tracks exports across files such that they can be added back in if necessary at a later point
			trackExports(options)
		]
	};
}
