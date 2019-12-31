import {TS} from "../../../../../type/ts";
import {visitNode} from "./visitor/visit-node";
import {ModuleBlockExtractorOptions} from "./module-block-extractor-options";
import {shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";

export function moduleBlockExtractor({typescript, context, ...options}: ModuleBlockExtractorOptions): TS.SourceFile {
	if (shouldDebugSourceFile(options.pluginOptions.debug, options.sourceFile)) {
		console.log(`=== BEFORE EXTRACTING MODULE BLOCKS === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(options.sourceFile));
	}

	// Prepare some VisitorOptions
	const visitorOptions = {
		...options,
		typescript,
		context,

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

	const result = typescript.visitEachChild(options.sourceFile, nextNode => visitorOptions.continuation(nextNode), context);

	if (shouldDebugSourceFile(options.pluginOptions.debug, options.sourceFile)) {
		console.log(`=== AFTER EXTRACTING MODULE BLOCKS === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(result));
	}

	return result;
}
