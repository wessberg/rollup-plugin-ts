import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../util/modifier-util";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";

export function visitVariableStatement({node, typescript, sourceFile, markAsExported, ...options}: TrackExportsTransformerVisitorOptions<TS.VariableStatement>): void {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return;

	const identifiers = traceIdentifiers({node, sourceFile, typescript});

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
}
