import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {visitNode} from "./visitor/visit-node";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";

export function ensureNoDeclareModifierTransformer(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile)
		? logMetrics(`Ensuring no declare modifiers`, sourceFile.fileName)
		: undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile)
		? logTransformer("Ensuring no declare modifiers", sourceFile, printer)
		: undefined;

	// Prepare some VisitorOptions
	const visitorOptions = {
		...options,

		childContinuation: <U extends TS.Node>(node: U): U =>
			typescript.visitEachChild(
				node,
				nextNode =>
					visitNode({
						...visitorOptions,
						node: nextNode
					}),
				context
			),

		continuation: <U extends TS.Node>(node: U): U =>
			visitNode({
				...visitorOptions,
				node
			}) as U
	};

	const result = typescript.visitEachChild(sourceFile, nextNode => visitorOptions.continuation(nextNode), context);

	transformationLog?.finish(result);
	fullBenchmark?.finish();

	return result;
}
