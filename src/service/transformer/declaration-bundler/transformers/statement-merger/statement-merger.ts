import type {TS} from "../../../../../type/ts.js";
import type {StatementMergerVisitorOptions} from "./statement-merger-visitor-options.js";
import {visitNode} from "./visitor/visit-node.js";
import {getMergedImportDeclarationsForModules} from "../../util/get-merged-import-declarations-for-modules.js";
import {getMergedExportDeclarationsForModules} from "../../util/get-merged-export-declarations-for-modules.js";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug.js";
import {hasExportModifier} from "../../util/modifier-util.js";
import {logMetrics} from "../../../../../util/logging/log-metrics.js";
import {logTransformer} from "../../../../../util/logging/log-transformer.js";
import {preserveMeta} from "../../util/clone-node-with-meta.js";
import type {DeclarationTransformer} from "../../declaration-bundler-options.js";
import type {StatementMergerOptions} from "./statement-merger-options.js";
import {nodeHasSupportedExtension} from "../../util/node-has-supported-extension.js";

export function statementMerger({markAsModuleIfNeeded}: StatementMergerOptions): DeclarationTransformer {
	return options => {
		const {factory, typescript, context, sourceFile, pluginOptions, printer, extensions} = options;

		const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Statement merging`, sourceFile.fileName) : undefined;

		const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Statement merging", sourceFile, printer) : undefined;

		// Merge all of the imports
		const mergedImports = getMergedImportDeclarationsForModules(options);
		const {mergedExports, exportedBindings} = getMergedExportDeclarationsForModules({...options, isTypeOnly: false});
		const {mergedExports: mergedTypeOnlyExports} = getMergedExportDeclarationsForModules({...options, inputBindings: exportedBindings, isTypeOnly: true});
		const includedImportedModules = new Set<string>();
		const includedExportedModules = new Set<string | undefined>();
		const includedTypeOnlyExportedModules = new Set<string | undefined>();

		// Prepare some VisitorOptions
		const visitorOptions: Omit<StatementMergerVisitorOptions<TS.Node>, "node"> = {
			...options,

			preserveImportedModuleIfNeeded(module: string): TS.ImportDeclaration[] | undefined {
				if (includedImportedModules.has(module)) return undefined;
				includedImportedModules.add(module);
				return mergedImports.get(module);
			},

			preserveExportedModuleIfNeeded(module: string | undefined, typeOnly: boolean): TS.ExportDeclaration[] | undefined {
				const selectedIncludedExportedModules = typeOnly ? includedTypeOnlyExportedModules : includedExportedModules;
				const selectedMergedExports = typeOnly ? mergedTypeOnlyExports : mergedExports;

				if (selectedIncludedExportedModules.has(module)) return undefined;
				selectedIncludedExportedModules.add(module);
				return selectedMergedExports.get(module);
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
		const exportDeclarations = result.statements.filter(statement => typescript.isExportDeclaration(statement) || typescript.isExportAssignment(statement));
		const statementsWithExportModifier = result.statements.filter(statement => hasExportModifier(statement, typescript));

		const otherStatements = result.statements.filter(
			statement => !typescript.isImportDeclaration(statement) && !typescript.isExportDeclaration(statement) && !typescript.isExportAssignment(statement)
		);

		const importDeclarationsWithSupportedExtensions = importDeclarations.filter(importDeclaration => nodeHasSupportedExtension(importDeclaration, typescript, extensions));
		const exportDeclarationsWithSupportedExtensions = exportDeclarations.filter(exportDeclaration => nodeHasSupportedExtension(exportDeclaration, typescript, extensions));
		const importExportWithSupportedExtensionsCount =
			importDeclarationsWithSupportedExtensions.length + exportDeclarationsWithSupportedExtensions.length + statementsWithExportModifier.length;

		result = preserveMeta(
			factory.updateSourceFile(
				result,
				[
					...importDeclarations,
					...otherStatements,
					...exportDeclarations,
					...(importExportWithSupportedExtensionsCount === 0 && markAsModuleIfNeeded
						? // Create an 'export {}' declaration to mark the declaration file as module-based if it has no imports or exports
						  [factory.createExportDeclaration(undefined, false, factory.createNamedExports([]))]
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
	};
}
