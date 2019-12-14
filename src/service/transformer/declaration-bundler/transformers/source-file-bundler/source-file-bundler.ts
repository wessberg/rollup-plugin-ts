import {DeclarationBundlerOptions, DeclarationTransformer} from "../../declaration-bundler-options";
import {TS} from "../../../../../type/ts";
import {normalize} from "path";
import {applyTransformers} from "../../util/apply-transformers";
import {getChunkFilename} from "../../util/get-chunk-filename";

export function sourceFileBundler(options: DeclarationBundlerOptions, ...transformers: DeclarationTransformer[]): TS.TransformerFactory<TS.Bundle> {
	return context => {
		return bundle => {
			const updatedSourceFiles: TS.SourceFile[] = [];

			// Only consider those SourceFiles that are part of the current chunk to be emitted
			const sourceFilesForChunk = bundle.sourceFiles.filter(
				sourceFile => getChunkFilename({...options, fileName: sourceFile.fileName}) === options.absoluteChunkFileName
			);

			// Visit only the entry SourceFile(s)
			const entrySourceFiles = sourceFilesForChunk.filter(sourceFile => options.entryModules.includes(normalize(sourceFile.fileName)));
			const nonEntrySourceFiles = sourceFilesForChunk.filter(sourceFile => !entrySourceFiles.includes(sourceFile));

			for (const sourceFile of entrySourceFiles) {
				// Prepare some VisitorOptions
				const visitorOptions = {
					...options,
					context,
					otherSourceFiles: sourceFilesForChunk.filter(otherSourceFile => otherSourceFile !== sourceFile),
					sourceFile,
					lexicalEnvironment: {
						parent: undefined,
						bindings: new Map()
					},
					includedSourceFiles: new WeakSet<TS.SourceFile>(),
					declarationToDeconflictedBindingMap: new Map<number, string>(),
					nodeToOriginalSymbolMap: new WeakMap<TS.Node, TS.Symbol>(),
					sourceFileToExportedSymbolSet: new Map(),
					preservedImports: new Map()
				};

				updatedSourceFiles.push(applyTransformers({visitorOptions, transformers}));
			}

			for (const sourceFile of nonEntrySourceFiles) {
				updatedSourceFiles.push(options.typescript.updateSourceFileNode(sourceFile, [], true));
			}

			return options.typescript.updateBundle(bundle, updatedSourceFiles);
		};
	};
}
