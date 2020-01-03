import {EnsureModuleTransformerOptions} from "./ensure-module-transformer-options";
import {TS} from "../../../type/ts";

export function ensureModuleTransformer({typescript, sourceFile}: EnsureModuleTransformerOptions): TS.SourceFile {
	const importDeclarationCount = sourceFile.statements.filter(typescript.isImportDeclaration).length;
	const exportDeclarationCount = sourceFile.statements.filter(typescript.isExportDeclaration).length;
	const exportAssignmentCount = sourceFile.statements.filter(typescript.isExportAssignment).length;

	// If there's nothing to mark the file as a module, add an empty ExportDeclaration to mark it as such
	if (importDeclarationCount < 1 && exportDeclarationCount < 1 && exportAssignmentCount < 1) {
		return typescript.updateSourceFileNode(
			sourceFile,
			[...sourceFile.statements, typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([]))],
			sourceFile.isDeclarationFile,
			sourceFile.referencedFiles,
			sourceFile.typeReferenceDirectives,
			sourceFile.hasNoDefaultLib,
			sourceFile.libReferenceDirectives
		);
	}

	return sourceFile;
}
