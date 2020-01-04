import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {visitNode} from "./visitor/visit-node";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue";
import {NoExportDeclarationTransformerVisitorOptions} from "./no-export-declaration-transformer-visitor-options";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";

export function noExportDeclarationTransformer(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile)
		? logMetrics(`Removing ExportDeclarations`, sourceFile.fileName)
		: undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile)
		? logTransformer("Removing ExportDeclarations", sourceFile, printer)
		: undefined;

	const nodePlacementQueue = getNodePlacementQueue({typescript});

	// Prepare some VisitorOptions
	const visitorOptions: Omit<NoExportDeclarationTransformerVisitorOptions<TS.Node>, "node"> = {
		...options,
		...nodePlacementQueue,

		childContinuation: <U extends TS.Node>(node: U): U =>
			typescript.visitEachChild(
				node,
				nextNode =>
					nodePlacementQueue.wrapVisitResult(
						visitNode({
							...visitorOptions,
							node: nextNode
						})
					),
				context
			),

		continuation: <U extends TS.Node>(node: U): U =>
			nodePlacementQueue.wrapVisitResult(
				visitNode({
					...visitorOptions,
					node
				})
			) as U
	};

	const result = typescript.visitEachChild(sourceFile, nextNode => visitorOptions.continuation(nextNode), context);

	transformationLog?.finish(result);
	fullBenchmark?.finish();

	return result;
}
