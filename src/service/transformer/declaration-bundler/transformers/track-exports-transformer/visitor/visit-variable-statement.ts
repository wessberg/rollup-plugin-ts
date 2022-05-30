import {TS} from "../../../../../../type/ts.js";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options.js";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {hasExportModifier} from "../../../util/modifier-util.js";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers.js";

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
