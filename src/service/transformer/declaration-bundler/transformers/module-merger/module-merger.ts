import {visitNode} from "./visitor/visit-node.js";
import type {TS} from "../../../../../type/ts.js";
import type {ChildVisitResult, IncludeSourceFileOptions, ModuleMergerVisitorOptions, PayloadMap, VisitResult} from "./module-merger-visitor-options.js";
import type {DeclarationTransformer} from "../../declaration-bundler-options.js";
import {applyTransformers} from "../../util/apply-transformers.js";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue.js";
import {findMatchingImportedSymbol} from "../../util/find-matching-imported-symbol.js";
import {cloneNodeWithMeta, preserveMeta} from "../../util/clone-node-with-meta.js";
import type {ImportedSymbol} from "../track-imports-transformer/track-imports-transformer-visitor-options.js";
import {getChunkFilename} from "../../util/get-chunk-filename.js";
import {ensureNoExportModifierTransformer} from "../ensure-no-export-modifier-transformer/ensure-no-export-modifier-transformer.js";
import {noExportDeclarationTransformer} from "../no-export-declaration-transformer/no-export-declaration-transformer.js";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug.js";
import {logMetrics} from "../../../../../util/logging/log-metrics.js";
import {logTransformer} from "../../../../../util/logging/log-transformer.js";
import {getBindingFromLexicalEnvironment} from "../../util/get-binding-from-lexical-environment.js";

export function moduleMerger(...transformers: DeclarationTransformer[]): DeclarationTransformer {
	return options => {
		const {typescript, context, factory, sourceFile, pluginOptions, printer, preservedImports, inlinedModules} = options;

		const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Merging modules`, sourceFile.fileName) : undefined;

		const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Merging modules", sourceFile, printer) : undefined;

		const nodePlacementQueue = getNodePlacementQueue({typescript});

		// Prepare some VisitorOptions
		const visitorOptions: Omit<ModuleMergerVisitorOptions<TS.Node>, "node"> = {
			...options,
			...nodePlacementQueue,
			transformers,
			payload: undefined,

			childContinuation: <U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): ChildVisitResult<U> =>
				typescript.visitEachChild(
					node,
					nextNode =>
						nodePlacementQueue.wrapVisitResult(
							visitNode({
								...visitorOptions,
								payload,
								node: nextNode
							})
						),
					context
				),

			continuation: <U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): VisitResult<U> =>
				nodePlacementQueue.wrapVisitResult(
					visitNode({
						...visitorOptions,
						payload,
						node
					} as ModuleMergerVisitorOptions<U>)
				) as VisitResult<U>,

			getNameForInlinedModuleDeclaration(moduleSpecifier: string): string | undefined {
				const name = inlinedModules.get(moduleSpecifier);
				if (name == null) return undefined;
				return getBindingFromLexicalEnvironment(options.lexicalEnvironment, name) ?? name;
			},
			markModuleDeclarationAsInlined(moduleSpecifier: string, name: string): void {
				inlinedModules.set(moduleSpecifier, name);
			},

			shouldPreserveImportedSymbol(importedSymbol: ImportedSymbol): boolean {
				let importedSymbols = preservedImports.get(importedSymbol.moduleSpecifier);
				if (importedSymbols == null) {
					importedSymbols = new Set();
					preservedImports.set(importedSymbol.moduleSpecifier, importedSymbols);
				}

				// Preserve the import of there is no matching imported symbol already
				if (findMatchingImportedSymbol(importedSymbol, importedSymbols) != null) {
					return false;
				}

				// Otherwise, the import should be preserved!
				importedSymbols.add(importedSymbol);
				return true;
			},

			getMatchingSourceFile(moduleSpecifier: string, from: TS.SourceFile): TS.SourceFile | undefined {
				const resolvedSourceFile = options.resolveSourceFile(moduleSpecifier, from.fileName);

				const chunkForSourceFile = resolvedSourceFile == null ? undefined : getChunkFilename(resolvedSourceFile.fileName, options.chunks);
				const isSameChunk = resolvedSourceFile != null && chunkForSourceFile != null && chunkForSourceFile === options.chunk.paths.absolute;

				return resolvedSourceFile === from || !isSameChunk ? undefined : resolvedSourceFile;
			},

			includeSourceFile(
				sourceFileToInclude: TS.SourceFile,
				{
					allowDuplicate = false,
					allowExports = options.otherEntrySourceFilesForChunk.some(otherEntrySourceFileForChunk => otherEntrySourceFileForChunk.fileName === sourceFileToInclude.fileName),
					transformers: extraTransformers = [],
					...otherOptions
				}: Partial<IncludeSourceFileOptions> = {}
			): Iterable<TS.Statement> {
				// Never include the same SourceFile twice
				if (options.includedSourceFiles.has(sourceFileToInclude.fileName) && !allowDuplicate) return [];
				options.includedSourceFiles.add(sourceFileToInclude.fileName);

				const allTransformers =
					allowExports === true
						? [...transformers, ...extraTransformers]
						: [
								...transformers,
								// Removes 'export' modifiers from Nodes
								...(allowExports === false || allowExports === "skip-optional" ? [ensureNoExportModifierTransformer] : []),
								// Removes ExportDeclarations and ExportAssignments
								noExportDeclarationTransformer({
									preserveAliasedExports: allowExports === "skip-optional",
									preserveExportsWithModuleSpecifiers: allowExports === "skip-optional"
								}),
								...extraTransformers
						  ];

				const transformedSourceFile = applyTransformers({
					visitorOptions: {
						...visitorOptions,
						...otherOptions,
						allowExports,
						// If duplicates should be allowed, treat this context as empty
						includedSourceFiles: allowDuplicate ? new Set() : options.includedSourceFiles,

						sourceFile: sourceFileToInclude,
						otherEntrySourceFilesForChunk: []
					},
					transformers: [moduleMerger(...allTransformers), ...allTransformers]
				});

				// Keep track of the original symbols which will be lost when the nodes are cloned
				return transformedSourceFile.statements.map(node => cloneNodeWithMeta(node, options));
			}
		};

		let result = visitorOptions.continuation(sourceFile, undefined);

		// There may be prepended or appended nodes that hasn't been added yet. Do so!
		const [missingPrependNodes, missingAppendNodes] = nodePlacementQueue.flush();
		if (missingPrependNodes.length > 0 || missingAppendNodes.length > 0) {
			result = preserveMeta(
				factory.updateSourceFile(
					result,
					[...(missingPrependNodes as TS.Statement[]), ...result.statements, ...(missingAppendNodes as TS.Statement[])],
					result.isDeclarationFile,
					result.referencedFiles,
					result.typeReferenceDirectives,
					result.hasNoDefaultLib,
					result.libReferenceDirectives
				),
				result,
				options
			);
		}

		transformationLog?.finish(result);
		fullBenchmark?.finish();

		// Otherwise, return the result as it is
		return result;
	};
}
