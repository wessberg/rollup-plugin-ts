import {DeclarationBundlerOptions} from "../declaration-bundler-options";
import {normalize} from "path";
import {mergeExports} from "../util/merge-exports/merge-exports";
import {mergeImports} from "../util/merge-imports/merge-imports";
import {mergeTypeReferenceDirectives} from "../util/merge-file-references/merge-type-reference-directives";
import {mergeLibReferenceDirectives} from "../util/merge-file-references/merge-lib-reference-directives";
import {TS} from "../../../../type/ts";

export function statementMerger({declarationFilename, typescript, ...options}: DeclarationBundlerOptions): TS.TransformerFactory<TS.SourceFile> {
	return _ => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (sourceFileName !== normalize(declarationFilename)) return typescript.updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE STATEMENT MERGING === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			const mergedStatements = mergeExports(mergeImports([...sourceFile.statements], typescript), typescript);

			const result = typescript.updateSourceFileNode(
				sourceFile,
				mergedStatements.length < 1
					? // Create an 'export {}' declaration to mark the declaration file as module-based
					  [typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([]))]
					: mergedStatements,
				sourceFile.isDeclarationFile,
				sourceFile.referencedFiles,
				mergeTypeReferenceDirectives(sourceFile),
				sourceFile.hasNoDefaultLib,
				mergeLibReferenceDirectives(sourceFile)
			);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER STATEMENT MERGING === (${sourceFileName})`);
				console.log(options.printer.printFile(result));
			}

			return result;
		};
	};
}
