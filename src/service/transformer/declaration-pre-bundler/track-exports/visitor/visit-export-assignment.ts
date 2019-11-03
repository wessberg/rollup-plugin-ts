import {ExportAssignment, isIdentifier, VariableStatement} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";

/**
 * Visits the given ExportAssignment.
 * @param {TrackExportsVisitorOptions<ExportAssignment>} options
 * @returns {ExportAssignment | VariableStatement | undefined}
 */
export function visitExportAssignment({
	node,
	sourceFile,
	typeChecker,
	markAsExported
}: TrackExportsVisitorOptions<ExportAssignment>): ExportAssignment | VariableStatement | undefined {
	if (isIdentifier(node.expression)) {
		const declaration = getAliasedDeclaration(node.expression, typeChecker);
		if (declaration != null) {
			markAsExported({
				node: declaration,
				originalModule: sourceFile.fileName,
				isExternal: false,
				rawModuleSpecifier: undefined,
				defaultExport: true,
				name: node.expression.text,
				propertyName: undefined
			});
		}
	}

	return undefined;
}
