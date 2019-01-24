import {Bundle, CustomTransformers, SourceFile, TransformerFactory} from "typescript";
import {CustomTransformersFunction} from "./i-custom-transformer-options";

/**
 * Merges all of the given transformers
 * @param {(CustomTransformers|CustomTransformersFunction|undefined)[]} transformers
 * @returns {CustomTransformersFunction}
 */
export function mergeTransformers(...transformers: (CustomTransformers | CustomTransformersFunction | undefined)[]): CustomTransformersFunction {
	return options => {
		const instantiatedTransformers = transformers
			.filter(transformer => transformer != null)
			.map((transformer: CustomTransformers | CustomTransformersFunction) => (typeof transformer === "function" ? transformer(options) : transformer));

		const beforeTransformers = ([] as TransformerFactory<SourceFile>[]).concat.apply(
			[],
			instantiatedTransformers.map(transformer => transformer.before!).filter(beforeTransformer => beforeTransformer != null)
		);

		const afterTransformers = ([] as TransformerFactory<SourceFile>[]).concat.apply(
			[],
			instantiatedTransformers.map(transformer => transformer.after!).filter(afterTransformer => afterTransformer != null)
		);

		const afterDeclarationsTransformers = ([] as TransformerFactory<Bundle | SourceFile>[]).concat.apply(
			[],
			instantiatedTransformers.map(transformer => transformer.afterDeclarations!).filter(afterDeclarationTransformer => afterDeclarationTransformer != null)
		);

		return {
			before: beforeTransformers.length === 0 ? undefined : beforeTransformers,
			after: afterTransformers.length === 0 ? undefined : afterTransformers,
			afterDeclarations: afterDeclarationsTransformers.length === 0 ? undefined : afterDeclarationsTransformers
		};
	};
}
