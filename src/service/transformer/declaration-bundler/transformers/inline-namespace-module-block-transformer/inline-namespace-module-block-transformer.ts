import {TS} from "../../../../../type/ts";
import {visitNode} from "./visitor/visit-node";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";
import {preserveMeta} from "../../util/clone-node-with-meta";
import {DeclarationTransformer} from "../../declaration-bundler-options";
import {InlineNamespaceModuleBlockOptions} from "./inline-namespace-module-block-options";

export function inlineNamespaceModuleBlockTransformer({intentToAddImportDeclaration, intentToAddModuleDeclaration}: InlineNamespaceModuleBlockOptions): DeclarationTransformer {
	return options => {
		const {typescript, context, sourceFile, pluginOptions, printer} = options;

		const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Inlining ModuleBlock to be wrapped in a Namespace`, sourceFile.fileName) : undefined;

		const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Inlining ModuleBlock to be wrapped in a Namespace", sourceFile, printer) : undefined;

		// Prepare some VisitorOptions
		const visitorOptions = {
			...options,
			intentToAddImportDeclaration,
			intentToAddModuleDeclaration,

			childContinuation: <U extends TS.Node>(node: U): U =>
				typescript.visitEachChild(
					node,
					nextNode =>
						visitNode({
							...visitorOptions,
							node: nextNode
						}),
					context
				),

			continuation: <U extends TS.Node>(node: U): U =>
				visitNode({
					...visitorOptions,
					node
				}) as U
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
