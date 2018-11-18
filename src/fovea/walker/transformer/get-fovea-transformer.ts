import {IFoveaTransformerOptions} from "./i-fovea-transformer-options";
import {CustomTransformers, SourceFile, TransformationContext, Transformer, visitNode as visit} from "typescript";
import {IFoveaTransformerContext} from "./i-fovea-transformer-context";
import {IFoveaTransformer} from "./i-fovea-transformer";
import {createMutableFoveaStats} from "../../stats/create-mutable-fovea-stats";
import {visitNode} from "../visitor/node/visit-node";
import {ISourceFileTransformerContext} from "./i-source-file-transformer-context";
import {SourceFileContextKind} from "../shared/source-file-context-kind";

/**
 * Builds a new Fovea Transformer function based on the given options
 * @param {boolean} dryRun
 * @param {(fileName: string, diagnostics: FoveaDiagnostic[]) => void} onDiagnostics
 * @param {(fileName: string, stats: IImmutableFoveaStats) => void} onStats
 * @returns {IFoveaTransformer}
 */
export function getFoveaTransformer ({
																			 dryRun = false,
																			 onStats = () => {
																			 }
																		 }: Partial<IFoveaTransformerContext> = {}): IFoveaTransformer {
	return ({program, addDiagnostics}: IFoveaTransformerOptions): CustomTransformers => {

		return {
			before: [
				(transformationContext: TransformationContext): Transformer<SourceFile> => {

					return (sourceFile) => {
						// Prepare empty stats
						const stats = createMutableFoveaStats();

						// Prepare a context for the SourceFile
						const sourceFileContext: ISourceFileTransformerContext = {
							kind: SourceFileContextKind.TRANSFORMER,
							transformationContext,
							typeChecker: program.getTypeChecker(),
							addDiagnostics,
							updateStats: partialStats => {
								Object.assign(stats, partialStats);
							}
						};

						// Visit the SourceFile and generate a new SourceFile
						const newSourceFile = visit(sourceFile, node => visitNode(<SourceFile>node, sourceFileContext));

						// Invoke the 'onStats' hook
						onStats(sourceFile.fileName, stats);

						// Emit the original SourceFile if this is a dry run, otherwise emit the transformed SourceFile
						return dryRun
							? sourceFile
							: newSourceFile;
					};
				}
			]
		};
	};
}