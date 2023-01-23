import type {TS} from "../../../../../type/ts.js";
import {visitNode} from "./visitor/visit-node.js";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue.js";
import type {NoExportDeclarationTransformerVisitorOptions} from "./no-export-declaration-transformer-visitor-options.js";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug.js";
import {logMetrics} from "../../../../../util/logging/log-metrics.js";
import {logTransformer} from "../../../../../util/logging/log-transformer.js";
import {preserveMeta} from "../../util/clone-node-with-meta.js";
import type {DeclarationTransformer} from "../../declaration-bundler-options.js";
import type {NoExportDeclarationTransformerOptions} from "./no-export-declaration-transformer-options.js";

export function noExportDeclarationTransformer({
	preserveAliasedExports = false,
	preserveExportsWithModuleSpecifiers = false
}: Partial<NoExportDeclarationTransformerOptions> = {}): DeclarationTransformer {
	return options => {
		const {typescript, context, sourceFile, pluginOptions, printer} = options;

		const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Removing ExportDeclarations`, sourceFile.fileName) : undefined;

		const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Removing ExportDeclarations", sourceFile, printer) : undefined;

		const nodePlacementQueue = getNodePlacementQueue({typescript});

		// Prepare some VisitorOptions
		const visitorOptions: Omit<NoExportDeclarationTransformerVisitorOptions<TS.Node>, "node"> = {
			...options,
			...nodePlacementQueue,
			preserveAliasedExports,
			preserveExportsWithModuleSpecifiers,

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

		const result = preserveMeta(
			typescript.visitEachChild(sourceFile, nextNode => visitorOptions.continuation(nextNode), context),
			sourceFile,
			options
		);

		transformationLog?.finish(result);
		fullBenchmark?.finish();

		return result;
	};
}
