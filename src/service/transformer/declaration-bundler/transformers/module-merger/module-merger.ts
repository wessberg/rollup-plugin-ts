import {visitNode} from "./visitor/visit-node";
import {TS} from "../../../../../type/ts";
import {ChildVisitResult, IncludeSourceFileOptions, ModuleMergerVisitorOptions, PayloadMap, VisitResult} from "./module-merger-visitor-options";
import {DeclarationTransformer} from "../../declaration-bundler-options";
import {applyTransformers} from "../../util/apply-transformers";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue";
import {findMatchingImportedSymbol} from "../../util/find-matching-imported-symbol";
import {cloneNodeWithMeta, preserveMeta} from "../../util/clone-node-with-meta";
import {ImportedSymbol} from "../track-imports-transformer/track-imports-transformer-visitor-options";
import {getChunkFilename} from "../../util/get-chunk-filename";
import {ensureNoExportModifierTransformer} from "../ensure-no-export-modifier-transformer/ensure-no-export-modifier-transformer";
import {noExportDeclarationTransformer} from "../no-export-declaration-transformer/no-export-declaration-transformer";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";
import {isNodeFactory} from "../../util/is-node-factory";

export function moduleMerger(...transformers: DeclarationTransformer[]): DeclarationTransformer {
	return options => {
		const {typescript, context, compatFactory, sourceFile, pluginOptions, printer, preservedImports} = options;

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

				const allTransformers = allowExports
					? [...transformers, ...extraTransformers]
					: [
							...transformers,
							// Removes 'export' modifiers from Nodes
							ensureNoExportModifierTransformer,
							// Removes ExportDeclarations and ExportAssignments
							noExportDeclarationTransformer,
							...extraTransformers
					  ];

				const transformedSourceFile = applyTransformers({
					visitorOptions: {
						...visitorOptions,
						...otherOptions,
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
				isNodeFactory(compatFactory)
					? compatFactory.updateSourceFile(
							result,
							[...(missingPrependNodes as TS.Statement[]), ...result.statements, ...(missingAppendNodes as TS.Statement[])],
							result.isDeclarationFile,
							result.referencedFiles,
							result.typeReferenceDirectives,
							result.hasNoDefaultLib,
							result.libReferenceDirectives
					  )
					: compatFactory.updateSourceFileNode(
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
