import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {visitNode} from "./visitor/visit-node";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue";
import {NoExportDeclarationTransformerVisitorOptions} from "./no-export-declaration-transformer-visitor-options";
import {shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";

export function noExportDeclarationTransformer({typescript, context, ...options}: SourceFileBundlerVisitorOptions): TS.SourceFile {
	if (shouldDebugSourceFile(options.pluginOptions.debug, options.sourceFile)) {
		console.log(`=== BEFORE REMOVING EXPORT DECLARATIONS === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(options.sourceFile));
	}

	const nodePlacementQueue = getNodePlacementQueue({typescript});

	// Prepare some VisitorOptions
	const visitorOptions: Omit<NoExportDeclarationTransformerVisitorOptions<TS.Node>, "node"> = {
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

	const result = typescript.visitEachChild(options.sourceFile, nextNode => visitorOptions.continuation(nextNode), context);

	if (shouldDebugSourceFile(options.pluginOptions.debug, options.sourceFile)) {
		console.log(`=== AFTER REMOVING EXPORT DECLARATIONS === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(result));
	}

	return result;
}
