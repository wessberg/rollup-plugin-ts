import {DeclarationBundlerOptions, DeclarationTransformer} from "../../declaration-bundler-options";
import {TS} from "../../../../../type/ts";
import {applyTransformers} from "../../util/apply-transformers";
import {getChunkFilename} from "../../util/get-chunk-filename";
import {SourceFileBundlerVisitorOptions} from "./source-file-bundler-visitor-options";
import {formatLibReferenceDirective} from "../../util/format-lib-reference-directive";
import {formatTypeReferenceDirective} from "../../util/format-type-reference-directive";

export function sourceFileBundler(options: DeclarationBundlerOptions, ...transformers: DeclarationTransformer[]): TS.TransformerFactory<TS.Bundle> {
	return context => {
		return bundle => {
			const updatedSourceFiles: TS.SourceFile[] = [];
			const entryModulesArr = [...options.chunk.entryModules];

			// Only consider those SourceFiles that are part of the current chunk to be emitted
			const sourceFilesForChunk = bundle.sourceFiles.filter(
				sourceFile => getChunkFilename({...options, fileName: sourceFile.fileName}) === options.chunk.paths.absolute
			);

			// Visit only the entry SourceFile(s)
			const entrySourceFiles = sourceFilesForChunk
				.filter(sourceFile => options.chunk.entryModules.has(sourceFile.fileName))
				.sort((a, b) => (entryModulesArr.indexOf(a.fileName) < entryModulesArr.indexOf(b.fileName) ? -1 : 1));

			const nonEntrySourceFiles = sourceFilesForChunk.filter(sourceFile => !entrySourceFiles.includes(sourceFile));

			const [firstEntrySourceFile] = entrySourceFiles;
			const otherEntrySourceFilesForChunk = entrySourceFiles.filter(entrySourceFile => entrySourceFile !== firstEntrySourceFile);

			// Prepare some VisitorOptions
			const visitorOptions: SourceFileBundlerVisitorOptions = {
				...options,
				context,
				otherEntrySourceFilesForChunk,
				sourceFiles: [...bundle.sourceFiles],
				sourceFile: firstEntrySourceFile,
				lexicalEnvironment: {
					parent: undefined,
					bindings: new Map()
				},
				includedSourceFiles: new Set<string>([firstEntrySourceFile.fileName]),
				declarationToDeconflictedBindingMap: new Map<number, string>(),
				nodeToOriginalSymbolMap: new Map<TS.Node, TS.Symbol>(),
				nodeToOriginalNodeMap: new Map<TS.Node, TS.Node>(),
				preservedImports: new Map()
			};

			updatedSourceFiles.push(applyTransformers({visitorOptions, transformers}));

			for (const sourceFile of [...otherEntrySourceFilesForChunk, ...nonEntrySourceFiles]) {
				updatedSourceFiles.push(options.typescript.updateSourceFileNode(sourceFile, [], true));
			}

			// Merge lib- and type reference directives.
			const libReferenceDirectiveFileNames = new Set<string>();
			const typeReferenceDirectiveFileNames = new Set<string>();
			const prepends: TS.UnparsedSource[] = [];
			const bundleWithSyntheticLibReferences = (bundle as unknown) as {syntheticLibReferences?: readonly TS.FileReference[]};

			if (bundleWithSyntheticLibReferences.syntheticLibReferences != null) {
				for (const {fileName} of bundleWithSyntheticLibReferences.syntheticLibReferences) {
					libReferenceDirectiveFileNames.add(fileName);
				}
			}

			for (const updatedSourceFile of updatedSourceFiles) {
				for (const {fileName} of updatedSourceFile.libReferenceDirectives) {
					libReferenceDirectiveFileNames.add(fileName);
				}

				for (const {fileName} of updatedSourceFile.typeReferenceDirectives) {
					typeReferenceDirectiveFileNames.add(fileName);
				}

				for (const typeReferenceModule of options.sourceFileToTypeReferencesSet.get(updatedSourceFile.fileName) ?? new Set<string>()) {
					typeReferenceDirectiveFileNames.add(typeReferenceModule);
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
