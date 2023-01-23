import type {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";
import type {TS} from "../../../../../type/ts.js";
import {isReferenced} from "../reference/is-referenced/is-referenced.js";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug.js";
import {logMetrics} from "../../../../../util/logging/log-metrics.js";
import {logTransformer} from "../../../../../util/logging/log-transformer.js";
import {preserveMeta} from "../../util/clone-node-with-meta.js";
import {visitNode} from "./visitor/visit-node.js";

export function treeShaker(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Tree-shaking`, sourceFile.fileName) : undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Tree-shaking", sourceFile, printer) : undefined;

	// Prepare some VisitorOptions
	const visitorOptions = {
		...options,
		treeshakenCommentRanges: [],
		isReferenced: <U extends TS.Node>(node: U): boolean => isReferenced({...visitorOptions, node}),
		continuation: <U extends TS.Node>(node: U): U | undefined => visitNode({...visitorOptions, node}) as U | undefined
	};

	const updatedSourceFile = preserveMeta(typescript.visitEachChild(sourceFile, visitorOptions.continuation, context), sourceFile, options);

	transformationLog?.finish(updatedSourceFile);
	fullBenchmark?.finish();

	return updatedSourceFile;
}
