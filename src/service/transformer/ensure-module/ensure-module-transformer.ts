import type {TS} from "../../../type/ts.js";
import type {TransformerBaseOptions} from "../declaration-bundler/transformers/transformer-base-options.js";
import {nodeHasSupportedExtension} from "../declaration-bundler/util/node-has-supported-extension.js";

export function ensureModuleTransformer({typescript, factory, sourceFile, extensions}: TransformerBaseOptions): TS.SourceFile {
	// Only consider import declarations from modules with supported filenames
	const importDeclarationCount = sourceFile.statements
		.filter(typescript.isImportDeclaration)
		.filter(importDeclaration => nodeHasSupportedExtension(importDeclaration, typescript, extensions)).length;
	// Only consider import declarations from modules with supported filenames
	const exportDeclarationCount = sourceFile.statements
		.filter(typescript.isExportDeclaration)
		.filter(exportDeclaration => nodeHasSupportedExtension(exportDeclaration, typescript, extensions)).length;
	// Only consider import declarations from modules with supported filenames
	const exportAssignmentCount = sourceFile.statements.filter(typescript.isExportAssignment).length;

	// If there's nothing to mark the file as a module, add an empty ExportDeclaration to mark it as such
	if (importDeclarationCount < 1 && exportDeclarationCount < 1 && exportAssignmentCount < 1) {
		return factory.updateSourceFile(
			sourceFile,
			[...sourceFile.statements, factory.createExportDeclaration(undefined, false, factory.createNamedExports([]))],
			sourceFile.isDeclarationFile,
			sourceFile.referencedFiles,
			sourceFile.typeReferenceDirectives,
			sourceFile.hasNoDefaultLib,
			sourceFile.libReferenceDirectives
		);
	}

	return sourceFile;
}
