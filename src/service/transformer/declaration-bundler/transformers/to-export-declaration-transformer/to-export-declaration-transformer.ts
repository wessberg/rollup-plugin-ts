import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {visitNode} from "./visitor/visit-node";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue";
import {ToExportDeclarationTransformerVisitorOptions} from "./to-export-declaration-transformer-visitor-options";

export function toExportDeclarationTransformer({typescript, context, ...options}: SourceFileBundlerVisitorOptions): TS.SourceFile {
	if (options.pluginOptions.debug) {
		console.log(`=== BEFORE CONVERTING EXPORT MODIFIERS TO EXPORT DECLARATIONS === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(options.sourceFile));
	}

	const nodePlacementQueue = getNodePlacementQueue({typescript});

	// Prepare some VisitorOptions
	const visitorOptions: Omit<ToExportDeclarationTransformerVisitorOptions<TS.Node>, "node"> = {
		...options,
		context,
		typescript,
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

	let result = typescript.visitEachChild(options.sourceFile, nextNode => visitorOptions.continuation(nextNode), context);

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

	if (options.pluginOptions.debug) {
		console.log(`=== AFTER CONVERTING EXPORT MODIFIERS TO EXPORT DECLARATIONS === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(result));
	}

	return result;
}
