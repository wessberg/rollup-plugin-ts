import {CustomTransformers} from "typescript";

/**
 * Merges all of the given transformers
 * @param {(CustomTransformers|undefined)[]} transformers
 * @returns {CustomTransformers}
 */
export function mergeTransformers (...transformers: (CustomTransformers|undefined)[]): CustomTransformers {
	return {
		before: [].concat.apply([],
			transformers
				.filter(transformer => transformer != null)
				.map((transformer: CustomTransformers) => transformer.before)
				.filter(beforeTransformer => beforeTransformer != null)
		),
		after: [].concat.apply([],
			transformers
				.filter(transformer => transformer != null)
				.map((transformer: CustomTransformers) => transformer.after)
				.filter(afterTransformer => afterTransformer != null)
		),
		afterDeclarations: [].concat.apply([],
			transformers
				.filter(transformer => transformer != null)
				.map((transformer: CustomTransformers) => transformer.afterDeclarations)
				.filter(afterDeclarationsTransformer => afterDeclarationsTransformer != null)
		)

	};
}