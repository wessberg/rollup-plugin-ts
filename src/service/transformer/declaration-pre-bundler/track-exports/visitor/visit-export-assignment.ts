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
	markAsExported,
	pluginOptions,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<ExportAssignment>): ExportAssignment | VariableStatement | undefined {
	const declaration = getAliasedDeclaration(node.expression, typeChecker);

	if (isIdentifier(node.expression)) {
		const [propertyName, name] = getDeconflictedNameAndPropertyName(undefined, node.expression.text);

		markAsExported({
			node: declaration ?? node.expression,
			originalModule: sourceFile.fileName,
			isExternal: false,
			rawModuleSpecifier: undefined,
			defaultExport: true,
			name,
			propertyName
		});
	}

	// If the expression isn't a plain identifier, we'll have to come up with one
	else {
		if (pluginOptions.debug) {
			console.log(`WARNING: Did not handle ExportAssignment with an expression that wasn't an identifier`);
		}
	}

	return undefined;
}
