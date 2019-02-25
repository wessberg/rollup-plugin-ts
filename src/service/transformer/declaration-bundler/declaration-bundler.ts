import {CustomTransformers} from "typescript";
import {IDeclarationBundlerOptions} from "./i-declaration-bundler-options";
import {updateExports} from "./update-exports/update-exports";
import {deconflict} from "./deconflict/deconflict";

/**
 * Will bundle declaration files
 * @param {IDeclarationBundlerOptions} options
 * @returns {CustomTransformers}
 */
export function declarationBundler(options: IDeclarationBundlerOptions): CustomTransformers {
	return {
		afterDeclarations: [deconflict(options), updateExports(options)]
	};
}
