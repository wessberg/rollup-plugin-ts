import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {visitNode} from "./visitor/visit-node";

export function moduleBlockExtractor({typescript, context, ...options}: SourceFileBundlerVisitorOptions): TS.SourceFile {
	if (options.pluginOptions.debug) {
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

	if (options.pluginOptions.debug) {
		console.log(`=== AFTER EXTRACTING MODULE BLOCKS === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(result));
	}

	return result;
}
