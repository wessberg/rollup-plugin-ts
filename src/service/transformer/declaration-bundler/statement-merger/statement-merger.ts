import {createExportDeclaration, createNamedExports, SourceFile, TransformerFactory, updateSourceFileNode} from "typescript";
import {DeclarationBundlerOptions} from "../declaration-bundler-options";
import {normalize} from "path";
import {mergeExports} from "../util/merge-exports/merge-exports";
import {mergeImports} from "../util/merge-imports/merge-imports";

export function statementMerger({declarationFilename, ...options}: DeclarationBundlerOptions): TransformerFactory<SourceFile> {
	return _ => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (sourceFileName !== normalize(declarationFilename)) return updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE STATEMENT MERGING === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			const mergedStatements = mergeExports(mergeImports([...sourceFile.statements]));

			const result = updateSourceFileNode(
				sourceFile,
				mergedStatements.length < 1
					? // Create an 'export {}' declaration to mark the declaration file as module-based
					  [createExportDeclaration(undefined, undefined, createNamedExports([]))]
					: mergedStatements,
				sourceFile.isDeclarationFile,
				sourceFile.referencedFiles,
				sourceFile.typeReferenceDirectives,
				sourceFile.hasNoDefaultLib,
				sourceFile.libReferenceDirectives
			);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER STATEMENT MERGING === (${sourceFileName})`);
				console.log(options.printer.printFile(result));
			}

			return result;
		};
	};
}
