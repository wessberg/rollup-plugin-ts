import {updateVariableStatement, VariableStatement} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {getIdentifiersForNode} from "../../../declaration-bundler/util/get-identifiers-for-node";

/**
 * Visits the given VariableStatement.
 * @param {TrackExportsVisitorOptions<VariableStatement>} options
 * @returns {VariableStatement | undefined}
 */
export function visitVariableStatement({
	node,
	sourceFile,
	markAsExported,
	resolver,
	nodeIdentifierCache
}: TrackExportsVisitorOptions<VariableStatement>): VariableStatement | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;

	const identifiers = getIdentifiersForNode({node, resolver, sourceFile, nodeIdentifierCache});

	for (const identifier of identifiers.keys()) {
		markAsExported({
			node,
			defaultExport: hasDefaultExportModifier(node.modifiers),
			originalModule: sourceFile.fileName,
			name: identifier,
			propertyName: undefined
		});
	}

	// Remove the export modifier
	return updateVariableStatement(node, ensureHasDeclareModifier(removeExportModifier(node.modifiers)), node.declarationList);
}
