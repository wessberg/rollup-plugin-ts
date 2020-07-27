import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../../type/ts";
import {isReferenced} from "../reference/is-referenced/is-referenced";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";
import {preserveMeta} from "../../util/clone-node-with-meta";
import {visitNode} from "./visitor/visit-node";

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
