import {TS} from "../../../type/ts";
import {TransformerBaseOptions} from "../declaration-bundler/transformers/transformer-base-options";

export function ensureModuleTransformer({typescript, factory, sourceFile}: TransformerBaseOptions): TS.SourceFile {
	const importDeclarationCount = sourceFile.statements.filter(typescript.isImportDeclaration).length;
	const exportDeclarationCount = sourceFile.statements.filter(typescript.isExportDeclaration).length;
	const exportAssignmentCount = sourceFile.statements.filter(typescript.isExportAssignment).length;

	// If there's nothing to mark the file as a module, add an empty ExportDeclaration to mark it as such
	if (importDeclarationCount < 1 && exportDeclarationCount < 1 && exportAssignmentCount < 1) {
		return factory.updateSourceFile(
			sourceFile,
			[...sourceFile.statements, factory.createExportDeclaration(undefined, undefined, false, factory.createNamedExports([]))],
			sourceFile.isDeclarationFile,
			sourceFile.referencedFiles,
			sourceFile.typeReferenceDirectives,
			sourceFile.hasNoDefaultLib,
			sourceFile.libReferenceDirectives
		);
	}

	return sourceFile;
}
