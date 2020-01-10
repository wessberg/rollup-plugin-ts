import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../../type/ts";
import {StatementMergerVisitorOptions} from "./statement-merger-visitor-options";
import {visitNode} from "./visitor/visit-node";
import {getMergedImportDeclarationsForModules} from "../../util/get-merged-import-declarations-for-modules";
import {getMergedExportDeclarationsForModules} from "../../util/get-merged-export-declarations-for-modules";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {hasExportModifier} from "../../util/modifier-util";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";
import {preserveMeta} from "../../util/clone-node-with-meta";

export function statementMerger(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Statement merging`, sourceFile.fileName) : undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile)
		? logTransformer("Statement merging", sourceFile, printer)
		: undefined;

	// Merge all of the imports
	const mergedImports = getMergedImportDeclarationsForModules(sourceFile, typescript);
	const mergedExports = getMergedExportDeclarationsForModules(sourceFile, typescript);
	const includedImportedModules = new Set<string>();
	const includedExportedModules = new Set<string | undefined>();

	// Prepare some VisitorOptions
	const visitorOptions: Omit<StatementMergerVisitorOptions<TS.Node>, "node"> = {
		...options,

		preserveImportedModuleIfNeeded(module: string): TS.ImportDeclaration[] | undefined {
			if (includedImportedModules.has(module)) return undefined;
			includedImportedModules.add(module);
			return mergedImports.get(module);
		},

		preserveExportedModuleIfNeeded(module: string | undefined): TS.ExportDeclaration[] | undefined {
			if (includedExportedModules.has(module)) return undefined;
			includedExportedModules.add(module);
			return mergedExports.get(module);
		},

		childContinuation: <U extends TS.Node>(node: U): U | undefined =>
			typescript.visitEachChild(
				node,
				nextNode =>
					visitNode({
						...visitorOptions,
						node: nextNode
					}),
				context
			),

		continuation: <U extends TS.Node>(node: U): U | undefined =>
			visitNode({
				...visitorOptions,
				node
			}) as U | undefined
	};

	let result = typescript.visitEachChild(sourceFile, nextNode => visitorOptions.continuation(nextNode), context);
	const importDeclarations = result.statements.filter(typescript.isImportDeclaration);
	const exportDeclarations = result.statements.filter(
		statement => typescript.isExportDeclaration(statement) || typescript.isExportAssignment(statement)
	);
	const statementsWithExportModifier = result.statements.filter(statement => hasExportModifier(statement, typescript));

	const otherStatements = result.statements.filter(
		statement => !typescript.isImportDeclaration(statement) && !typescript.isExportDeclaration(statement) && !typescript.isExportAssignment(statement)
	);
	const importExportCount = importDeclarations.length + exportDeclarations.length + statementsWithExportModifier.length;

	result = preserveMeta(
		typescript.updateSourceFileNode(
			result,
			[
				...importDeclarations,
				...otherStatements,
				...exportDeclarations,
				...(importExportCount === 0
					? // Create an 'export {}' declaration to mark the declaration file as module-based if it has no imports or exports
					  [typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([]))]
					: [])
			],
			result.isDeclarationFile,
			result.referencedFiles,
			result.typeReferenceDirectives,
			result.hasNoDefaultLib,
			result.libReferenceDirectives
		),
		result,
		options
	);

	transformationLog?.finish(result);
	fullBenchmark?.finish();

	return result;
}
