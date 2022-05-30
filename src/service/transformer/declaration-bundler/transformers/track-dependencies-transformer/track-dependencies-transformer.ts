import {TS} from "../../../../../type/ts.js";
import {visitNode} from "./visitor/visit-node.js";
import {TrackDependenciesOptions, TrackDependenciesTransformerVisitorOptions} from "./track-dependencies-transformer-visitor-options.js";
import {ModuleDependency} from "../../../../../util/get-module-dependencies/get-module-dependencies.js";

export function trackDependenciesTransformer(options: TrackDependenciesOptions): Set<ModuleDependency> {
	const typescript = options.host.getTypescript();
	const dependencies: Set<ModuleDependency> = new Set();

	// Prepare some VisitorOptions
	const visitorOptions: Omit<TrackDependenciesTransformerVisitorOptions<TS.Node>, "node"> = {
		...options,
		typescript,
		// Optimization: We only need to traverse nested nodes inside of the SourceFile if it contains at least one ImportTypeNode (or at least what appears to be one)
		shouldDeepTraverse: options.sourceFile.text.includes("import("),

		addDependency(resolvedModule: ModuleDependency): void {
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
