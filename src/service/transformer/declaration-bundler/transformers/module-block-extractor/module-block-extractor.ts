import {TS} from "../../../../../type/ts";
import {visitNode} from "./visitor/visit-node";
import {ModuleBlockExtractorOptions} from "./module-block-extractor-options";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";
import {ModuleBlockExtractorVisitorOptions} from "./module-block-extractor-visitor-options";
import {preserveMeta} from "../../util/clone-node-with-meta";

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

		continuation: <U extends TS.Node>(node: U): TS.VisitResult<TS.Node> =>
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
