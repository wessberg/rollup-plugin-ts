import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {getIdentifiersForNode} from "../../../declaration-bundler/util/get-identifiers-for-node";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given VariableStatement.
 */
export function visitVariableStatement({
	node,
	sourceFile,
	markAsExported,
	resolver,
	nodeIdentifierCache,
	typescript
}: TrackExportsVisitorOptions<TS.VariableStatement>): TS.VariableStatement | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const identifiers = getIdentifiersForNode({node, resolver, sourceFile, nodeIdentifierCache, typescript});

	for (const identifier of identifiers.keys()) {
		markAsExported({
			name: identifier,
			propertyName: undefined,
			node,
			defaultExport: hasDefaultExportModifier(node.modifiers, typescript),
			originalModule: normalize(sourceFile.fileName),
			rawModuleSpecifier: undefined,
			isExternal: false
		});
	}

	// Remove the export modifier
	return typescript.updateVariableStatement(
		node,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.declarationList
	);
}
