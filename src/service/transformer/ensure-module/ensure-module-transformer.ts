import {EnsureModuleTransformerOptions} from "./ensure-module-transformer-options";
import {TS} from "../../../type/ts";
import {isNodeFactory} from "../declaration-bundler/util/is-node-factory";

export function ensureModuleTransformer({typescript, compatFactory, sourceFile}: EnsureModuleTransformerOptions): TS.SourceFile {
	const importDeclarationCount = sourceFile.statements.filter(typescript.isImportDeclaration).length;
	const exportDeclarationCount = sourceFile.statements.filter(typescript.isExportDeclaration).length;
	const exportAssignmentCount = sourceFile.statements.filter(typescript.isExportAssignment).length;

	// If there's nothing to mark the file as a module, add an empty ExportDeclaration to mark it as such
	if (importDeclarationCount < 1 && exportDeclarationCount < 1 && exportAssignmentCount < 1) {
		return isNodeFactory(compatFactory)
			? compatFactory.updateSourceFile(
					sourceFile,
					[...sourceFile.statements, compatFactory.createExportDeclaration(undefined, undefined, false, compatFactory.createNamedExports([]))],
					sourceFile.isDeclarationFile,
					sourceFile.referencedFiles,
					sourceFile.typeReferenceDirectives,
					sourceFile.hasNoDefaultLib,
					sourceFile.libReferenceDirectives
			  )
			: compatFactory.updateSourceFileNode(
					sourceFile,
					[...sourceFile.statements, compatFactory.createExportDeclaration(undefined, undefined, compatFactory.createNamedExports([]))],
					sourceFile.isDeclarationFile,
					sourceFile.referencedFiles,
					sourceFile.typeReferenceDirectives,
					sourceFile.hasNoDefaultLib,
					sourceFile.libReferenceDirectives
			  );
	}

	return sourceFile;
}
