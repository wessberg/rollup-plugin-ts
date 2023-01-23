import type {TS} from "../../../../../../type/ts.js";
import type {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options.js";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {hasExportModifier} from "../../../util/modifier-util.js";

export function visitFunctionExpression({node, typescript, markAsExported, ...options}: TrackExportsTransformerVisitorOptions<TS.FunctionExpression>): void {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript) || node.name == null) return;

	const {exportedSymbol} = createExportSpecifierFromNameAndModifiers({
		...options,
		name: node.name.text,
		modifiers: node.modifiers,
		typescript
	});

	// Also mark the node as exported so that we can track it later
	markAsExported(exportedSymbol);
}
