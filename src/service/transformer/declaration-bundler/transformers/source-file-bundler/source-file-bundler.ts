import {DeclarationBundlerOptions, DeclarationTransformer} from "../../declaration-bundler-options";
import {TS} from "../../../../../type/ts";
import {applyTransformers} from "../../util/apply-transformers";
import {getChunkFilename} from "../../util/get-chunk-filename";
import {SourceFileBundlerVisitorOptions} from "./source-file-bundler-visitor-options";
import {formatLibReferenceDirective} from "../../util/merge-lib-reference-directives";
import {formatTypeReferenceDirective} from "../../util/merge-type-reference-directives";

export function sourceFileBundler(options: DeclarationBundlerOptions, ...transformers: DeclarationTransformer[]): TS.TransformerFactory<TS.Bundle> {
	return context => {
		return bundle => {
			const updatedSourceFiles: TS.SourceFile[] = [];

			// Only consider those SourceFiles that are part of the current chunk to be emitted
			const sourceFilesForChunk = bundle.sourceFiles.filter(
				sourceFile => getChunkFilename({...options, fileName: sourceFile.fileName}) === options.chunk.paths.absolute
			);

			// Visit only the entry SourceFile(s)
			const entrySourceFiles = sourceFilesForChunk.filter(sourceFile => options.chunk.entryModules.includes(sourceFile.fileName));
			const nonEntrySourceFiles = sourceFilesForChunk.filter(sourceFile => !entrySourceFiles.includes(sourceFile));

			for (let i = 0; i < entrySourceFiles.length; i++) {
				const sourceFile = entrySourceFiles[i];
				// Prepare some VisitorOptions
				const visitorOptions: SourceFileBundlerVisitorOptions = {
					...options,
					context,
					otherSourceFiles: sourceFilesForChunk.filter(otherSourceFile => otherSourceFile !== sourceFile),
					isLastSourceFileForChunk: i === entrySourceFiles.length - 1,
					sourceFile,
					lexicalEnvironment: {
						parent: undefined,
						bindings: new Map()
					},
					includedSourceFiles: new WeakSet<TS.SourceFile>(),
					declarationToDeconflictedBindingMap: new Map<number, string>(),
					nodeToOriginalSymbolMap: new Map<TS.Node, TS.Symbol>(),
					preservedImports: new Map()
				};

				updatedSourceFiles.push(applyTransformers({visitorOptions, transformers}));
			}

			for (const sourceFile of nonEntrySourceFiles) {
				updatedSourceFiles.push(options.typescript.updateSourceFileNode(sourceFile, [], true));
			}

			// Merge lib- and type reference directives.
			const libReferenceDirectiveFileNames = new Set<string>();
			const typeReferenceDirectiveFileNames = new Set<string>();
			const prepends: TS.UnparsedSource[] = [];

			for (const {fileName} of ((bundle as unknown) as {syntheticLibReferences: readonly TS.FileReference[]}).syntheticLibReferences) {
				libReferenceDirectiveFileNames.add(fileName);
			}

			for (const {fileName} of ((bundle as unknown) as {syntheticTypeReferences: readonly TS.FileReference[]}).syntheticTypeReferences) {
				typeReferenceDirectiveFileNames.add(fileName);
			}

			for (const updatedSourceFile of updatedSourceFiles) {
				for (const {fileName} of updatedSourceFile.libReferenceDirectives) {
					libReferenceDirectiveFileNames.add(fileName);
				}

				for (const {fileName} of updatedSourceFile.typeReferenceDirectives) {
					typeReferenceDirectiveFileNames.add(fileName);
				}
			}

			for (const fileName of libReferenceDirectiveFileNames) {
				prepends.push(options.typescript.createUnparsedSourceFile(formatLibReferenceDirective(fileName)));
			}

			for (const fileName of typeReferenceDirectiveFileNames) {
				prepends.push(options.typescript.createUnparsedSourceFile(formatTypeReferenceDirective(fileName)));
			}

			return options.typescript.updateBundle(bundle, updatedSourceFiles, prepends);
		};
	};
}
