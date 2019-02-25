import {CustomTransformers} from "typescript";
import {IDeclarationTransformersOptions} from "./i-declaration-transformers-options";
import {afterDeclarations} from "./after-declarations/after-declarations";

/**
 * Will transform declaration files
 * @param {IDeclarationTransformersOptions} options
 * @returns {CustomTransformers}
 */
export function declarationTransformers(options: IDeclarationTransformersOptions): CustomTransformers {
	return {
		afterDeclarations: [afterDeclarations(options)]
	};
}
