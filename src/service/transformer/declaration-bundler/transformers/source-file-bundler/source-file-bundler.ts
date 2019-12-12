import {DeclarationBundlerOptions, DeclarationTransformer} from "../../declaration-bundler-options";
import {TS} from "../../../../../type/ts";
import {normalize} from "path";
import {applyTransformers} from "../../util/apply-transformers";

export function sourceFileBundler(options: DeclarationBundlerOptions, ...transformers: DeclarationTransformer[]): TS.TransformerFactory<TS.Bundle> {
	return context => {
		return bundle => {
			const updatedSourceFiles: TS.SourceFile[] = [];

			// Visit only the entry SourceFile(s)
			const entrySourceFiles = bundle.sourceFiles.filter(sourceFile => options.entryModules.includes(normalize(sourceFile.fileName)));
			const nonEntrySourceFiles = bundle.sourceFiles.filter(sourceFile => !entrySourceFiles.includes(sourceFile));

			for (const sourceFile of entrySourceFiles) {
				// Prepare some VisitorOptions
				const visitorOptions = {
					...options,
					context,
					otherSourceFiles: bundle.sourceFiles.filter(otherSourceFile => otherSourceFile !== sourceFile),
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
