import {CustomTransformers} from "typescript";
import {IDeclarationTreeShakerOptions} from "./i-declaration-tree-shaker-options";
import {afterDeclarations} from "./after-declarations/after-declarations";

/**
 * Will tree-shake declaration files
 * @param {IDeclarationTreeShakerOptions} options
 * @returns {CustomTransformers}
 */
export function declarationTreeShaker(options: IDeclarationTreeShakerOptions): CustomTransformers {
	return {
		afterDeclarations: [afterDeclarations(options)]
	};
}
