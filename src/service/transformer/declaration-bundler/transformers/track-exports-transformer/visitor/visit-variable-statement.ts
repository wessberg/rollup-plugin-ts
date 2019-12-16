import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../util/modifier-util";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";

export function visitVariableStatement({
	node,
	typescript,
	resolver,
	nodeIdentifierCache,
	sourceFile,
	markAsExported,
	...options
}: TrackExportsTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const identifiers = traceIdentifiers({node, resolver, sourceFile, nodeIdentifierCache, typescript});

	for (const identifier of identifiers) {
		const {exportedSymbol} = createExportSpecifierFromNameAndModifiers({
			...options,
			name: identifier,
			modifiers: node.modifiers,
			typescript
		});

		// Also mark the node as exported so that we can track it later
		markAsExported(exportedSymbol);
	}

	return node;
}
