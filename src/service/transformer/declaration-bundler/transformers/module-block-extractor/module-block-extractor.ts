import type {TS} from "../../../../../type/ts.js";
import {visitNode} from "./visitor/visit-node.js";
import type {ModuleBlockExtractorOptions} from "./module-block-extractor-options.js";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug.js";
import {logMetrics} from "../../../../../util/logging/log-metrics.js";
import {logTransformer} from "../../../../../util/logging/log-transformer.js";
import type {ModuleBlockExtractorVisitorOptions} from "./module-block-extractor-visitor-options.js";
import {preserveMeta} from "../../util/clone-node-with-meta.js";

export function moduleBlockExtractor(options: ModuleBlockExtractorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Extracting module blocks`, sourceFile.fileName) : undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Extracting module blocks", sourceFile, printer) : undefined;

	// Prepare some VisitorOptions
	const visitorOptions: Omit<ModuleBlockExtractorVisitorOptions<TS.Node>, "node"> = {
		...options,

		childContinuation: <U extends TS.Node>(node: U): TS.VisitResult<TS.Node> =>
			typescript.visitEachChild(
				node,
				nextNode =>
					visitNode({
						...visitorOptions,
						node: nextNode
					}),
				context
			),

		continuation: <U extends TS.Node>(node: U): TS.VisitResult<TS.Node> | undefined =>
			visitNode({
				...visitorOptions,
				node
			})
	};

	const result = preserveMeta(
		typescript.visitEachChild(sourceFile, nextNode => visitorOptions.continuation(nextNode), context),
		sourceFile,
		options
	);

	transformationLog?.finish(result);
	fullBenchmark?.finish();

	return result;
}
