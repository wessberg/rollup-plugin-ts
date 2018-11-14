import {IFoveaTransformerOptions} from "./i-fovea-transformer-options";
import {CustomTransformers, SourceFile, Transformer, visitNode as visit, TransformationContext} from "typescript";
import {IFoveaTransformerContext} from "./i-fovea-transformer-context";
import {IFoveaTransformer} from "./i-fovea-transformer";
import {createMutableFoveaStats} from "../stats/create-mutable-fovea-stats";
import {visitNode} from "./visitor/visit-node";
import {ISourceFileContext} from "./i-source-file-context";
import {createFoveaDiagnostics} from "../diagnostic/create-fovea-diagnostics";

/**
 * Builds a new Fovea Transformer function based on the given options
 * @param {boolean} dryRun
 * @param {(fileName: string, diagnostics: FoveaDiagnostic[]) => void} onDiagnostics
 * @param {(fileName: string, stats: IImmutableFoveaStats) => void} onStats
 * @returns {IFoveaTransformer}
 */
export function getFoveaTransformer ({
																			 dryRun = false,
																			 onDiagnostics = () => {},
																			 onStats = () => {}}: Partial<IFoveaTransformerContext> = {}): IFoveaTransformer {
	return ({program}: IFoveaTransformerOptions): CustomTransformers => {

		return {
			before: [
				(transformationContext: TransformationContext): Transformer<SourceFile> => {

					return (sourceFile) => {
						// Prepare empty stats
						const stats = createMutableFoveaStats();
						// Prepare empty diagnostics
						const diagnostics = createFoveaDiagnostics(sourceFile.fileName);

						// Prepare a context for the SourceFile
						const sourceFileContext: ISourceFileContext = {
							transformationContext,
							typeChecker: program.getTypeChecker(),

							addDiagnostic: diagnostic => {
								diagnostics.push(diagnostic);
							},
							updateStats: partialStats => {
								Object.assign(stats, partialStats);
							}
						};

						// Visit the SourceFile and generate a new SourceFile
						const newSourceFile = visit(sourceFile, node => visitNode(<SourceFile>node, sourceFileContext));

						// Invoke the 'onDiagnostics' hook
						onDiagnostics(sourceFile.fileName, diagnostics);

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