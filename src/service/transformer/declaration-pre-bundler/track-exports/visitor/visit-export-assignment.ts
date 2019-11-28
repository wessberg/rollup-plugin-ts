import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ExportAssignment.
 */
export function visitExportAssignment({
	node,
	sourceFile,
	typeChecker,
	markAsExported,
	pluginOptions,
	typescript
}: TrackExportsVisitorOptions<TS.ExportAssignment>): TS.ExportAssignment | TS.VariableStatement | undefined {
	const declaration = getAliasedDeclaration(node.expression, typeChecker);

	if (typescript.isIdentifier(node.expression)) {
		markAsExported({
			node: declaration ?? node.expression,
			originalModule: normalize(sourceFile.fileName),
			isExternal: false,
			rawModuleSpecifier: undefined,
			defaultExport: true,
			name: node.expression.text,
			propertyName: undefined
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
