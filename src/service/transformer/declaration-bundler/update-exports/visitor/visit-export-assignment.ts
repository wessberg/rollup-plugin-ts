import {ExportAssignment, isIdentifier, VariableStatement} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";

/**
 * Visits the given ExportAssignment.
 * @param {UpdateExportsVisitorOptions<ExportAssignment>} options
 * @returns {ExportAssignment | VariableStatement | undefined}
 */
export function visitExportAssignment({
	node,
	sourceFile,
	isEntry,
	typeChecker,
	identifiersForDefaultExportsForModules
}: UpdateExportsVisitorOptions<ExportAssignment>): ExportAssignment | VariableStatement | undefined {
	// Only preserve the node if it is part of the entry file for the chunk
	if (isEntry) {
		return node;
	} else if (isIdentifier(node.expression)) {
		const declaration = getAliasedDeclaration(node.expression, typeChecker);
		if (declaration != null) {
			identifiersForDefaultExportsForModules.set(sourceFile.fileName, [node.expression.text, declaration.kind]);
		}
	}

	return undefined;
}
