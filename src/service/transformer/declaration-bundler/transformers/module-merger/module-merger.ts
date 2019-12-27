import {visitNode} from "./visitor/visit-node";
import {TS} from "../../../../../type/ts";
import {ChildVisitResult, IncludeSourceFileOptions, ModuleMergerVisitorOptions, PayloadMap, VisitResult} from "./module-merger-visitor-options";
import {DeclarationTransformer} from "../../declaration-bundler-options";
import {applyTransformers} from "../../util/apply-transformers";
import {getNodePlacementQueue} from "../../util/get-node-placement-queue";
import {findMatchingImportedSymbol} from "../../util/find-matching-imported-symbol";
import {cloneNodeWithSymbols} from "../../util/clone-node-with-symbols";
import {ImportedSymbol} from "../../../cross-chunk-reference-tracker/transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {getChunkFilename} from "../../util/get-chunk-filename";
import {ensureNoExportModifierTransformer} from "../ensure-no-export-modifier-transformer/ensure-no-export-modifier-transformer";
import {noExportDeclarationTransformer} from "../no-export-declaration-transformer/no-export-declaration-transformer";

export function moduleMerger(...transformers: DeclarationTransformer[]): DeclarationTransformer {
	return options => {
		const nodePlacementQueue = getNodePlacementQueue({typescript: options.typescript});

		// Prepare some VisitorOptions
		const visitorOptions: Omit<ModuleMergerVisitorOptions<TS.Node>, "node"> = {
			...options,
			...nodePlacementQueue,
			transformers,
			payload: undefined,

			childContinuation: <U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): ChildVisitResult<U> => {
				return options.typescript.visitEachChild(
					node,
					nextNode =>
						nodePlacementQueue.wrapVisitResult(
							visitNode({
								...visitorOptions,
								payload,
								node: nextNode
							})
						),
					options.context
				);
			},

			continuation: <U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): VisitResult<U> => {
				return nodePlacementQueue.wrapVisitResult(
					visitNode({
						...visitorOptions,
						payload,
						node
					} as ModuleMergerVisitorOptions<U>)
				) as VisitResult<U>;
			},

			shouldPreserveImportedSymbol(importedSymbol: ImportedSymbol): boolean {
				let importedSymbols = options.preservedImports.get(importedSymbol.moduleSpecifier);
				if (importedSymbols == null) {
					importedSymbols = new Set();
					options.preservedImports.set(importedSymbol.moduleSpecifier, importedSymbols);
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
				const sourceFile = options.moduleSpecifierToSourceFileMap.get(moduleSpecifier);
				const chunkForSourceFile = sourceFile == null ? undefined : getChunkFilename({...options, fileName: sourceFile.fileName});
				const isSameChunk = sourceFile != null && chunkForSourceFile != null && chunkForSourceFile === options.chunk.paths.absolute;
				return sourceFile === from || !isSameChunk ? undefined : sourceFile;
			},

			includeSourceFile(
				sourceFile: TS.SourceFile,
				{
					allowDuplicate = false,
					allowExports = options.otherEntrySourceFilesForChunk.some(
						otherEntrySourceFileForChunk => otherEntrySourceFileForChunk.fileName === sourceFile.fileName
					),
					transformers: extraTransformers = [],
					...otherOptions
				}: Partial<IncludeSourceFileOptions> = {}
			): Iterable<TS.Statement> {
				// Never include the same SourceFile twice
				if (options.includedSourceFiles.has(sourceFile.fileName) && !allowDuplicate) return [];
				options.includedSourceFiles.add(sourceFile.fileName);

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
						sourceFile,
						otherEntrySourceFilesForChunk: []
					},
					transformers: [moduleMerger(...allTransformers), ...allTransformers]
				});

				// Keep track of the original symbols which will be lost when the nodes are cloned
				return transformedSourceFile.statements.map(node => cloneNodeWithSymbols({...options, node}));
			}
		};

		const result = visitorOptions.continuation(options.sourceFile, undefined);

		// There may be prepended or appended nodes that hasn't been added yet. Do so!
		const [missingPrependNodes, missingAppendNodes] = nodePlacementQueue.flush();
		if (missingPrependNodes.length > 0 || missingAppendNodes.length > 0) {
			return options.typescript.updateSourceFileNode(
				result,
				[...(missingPrependNodes as TS.Statement[]), ...result.statements, ...(missingAppendNodes as TS.Statement[])],
				result.isDeclarationFile,
				result.referencedFiles,
				result.typeReferenceDirectives,
				result.hasNoDefaultLib,
				result.libReferenceDirectives
			);
		}

		// Otherwise, return the result as it is
		return result;
	};
}
