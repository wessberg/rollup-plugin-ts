import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../../../type/ts";
import {mergeImports} from "../../../../declaration-bundler/util/merge-imports/merge-imports";
import {mergeExports} from "../../../../declaration-bundler/util/merge-exports/merge-exports";
import {mergeTypeReferenceDirectives} from "../../../../declaration-bundler/util/merge-file-references/merge-type-reference-directives";
import {mergeLibReferenceDirectives} from "../../../../declaration-bundler/util/merge-file-references/merge-lib-reference-directives";

export function statementMerger({typescript, context, ...options}: SourceFileBundlerVisitorOptions): TS.SourceFile {
	if (options.pluginOptions.debug) {
		console.log(`=== BEFORE STATEMENT MERGING === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(options.sourceFile));
	}

	const mergedStatements = mergeExports(mergeImports([...options.sourceFile.statements], typescript), typescript);

	const result = typescript.updateSourceFileNode(
		options.sourceFile,
		mergedStatements.length < 1
			? // Create an 'export {}' declaration to mark the declaration file as module-based
			  [typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([]))]
			: mergedStatements,
		options.sourceFile.isDeclarationFile,
		options.sourceFile.referencedFiles,
		mergeTypeReferenceDirectives(options.sourceFile),
		options.sourceFile.hasNoDefaultLib,
		mergeLibReferenceDirectives(options.sourceFile)
	);

	if (options.pluginOptions.debug) {
		console.log(`=== AFTER STATEMENT MERGING === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(result));
	}

	return result;
}
