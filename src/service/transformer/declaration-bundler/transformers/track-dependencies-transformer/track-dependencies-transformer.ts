import {TS} from "../../../../../type/ts";
import {visitNode} from "./visitor/visit-node";
import {TrackDependenciesOptions, TrackDependenciesTransformerVisitorOptions} from "./track-dependencies-transformer-visitor-options";
import {ExtendedResolvedModule} from "../../../../cache/resolve-cache/extended-resolved-module";

export function trackDependenciesTransformer(options: TrackDependenciesOptions): Set<ExtendedResolvedModule> {
	const {typescript} = options;
	const dependencies: Set<ExtendedResolvedModule> = new Set();

	// Prepare some VisitorOptions
	const visitorOptions: Omit<TrackDependenciesTransformerVisitorOptions<TS.Node>, "node"> = {
		...options,
		// Optimization: We only need to traverse nested nodes inside of the SourceFile if it contains at least one ImportTypeNode (or at least what appears to be one)
		shouldDeepTraverse: options.sourceFile.text.includes("import("),

		addDependency(resolvedModule: ExtendedResolvedModule): void {
			dependencies.add(resolvedModule);
		},

		childContinuation: <U extends TS.Node>(node: U): void =>
			typescript.forEachChild(node, nextNode => {
				visitNode({
					...visitorOptions,
					node: nextNode
				});
			}),

		continuation: <U extends TS.Node>(node: U): void => {
			visitNode({
				...visitorOptions,
				node
			});
		}
	};

	typescript.forEachChild(options.sourceFile, nextNode => {
		visitorOptions.continuation(nextNode);
	});
	return dependencies;
}
