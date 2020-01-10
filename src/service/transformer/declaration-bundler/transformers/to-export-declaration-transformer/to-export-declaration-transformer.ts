import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {visitNode} from "./visitor/visit-node";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue";
import {ToExportDeclarationTransformerVisitorOptions} from "./to-export-declaration-transformer-visitor-options";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";
import {preserveMeta} from "../../util/clone-node-with-meta";

export function toExportDeclarationTransformer(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile)
		? logMetrics(`Adding ExportDeclarations`, sourceFile.fileName)
		: undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile)
		? logTransformer("Adding ExportDeclarations", sourceFile, printer)
		: undefined;

	const nodePlacementQueue = getNodePlacementQueue({typescript});

	// Prepare some VisitorOptions
	const visitorOptions: Omit<ToExportDeclarationTransformerVisitorOptions<TS.Node>, "node"> = {
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

	let result = typescript.visitEachChild(sourceFile, nextNode => visitorOptions.continuation(nextNode), context);

	// There may be prepended or appended nodes that hasn't been added yet. Do so!
	const [missingPrependNodes, missingAppendNodes] = nodePlacementQueue.flush();
	if (missingPrependNodes.length > 0 || missingAppendNodes.length > 0) {
		result = typescript.updateSourceFileNode(
			result,
			[...(missingPrependNodes as TS.Statement[]), ...result.statements, ...(missingAppendNodes as TS.Statement[])],
			result.isDeclarationFile,
			result.referencedFiles,
			result.typeReferenceDirectives,
			result.hasNoDefaultLib,
			result.libReferenceDirectives
		);
	}

	result = preserveMeta(result, result, options);

	transformationLog?.finish(result);
	fullBenchmark?.finish();

	return result;
}
