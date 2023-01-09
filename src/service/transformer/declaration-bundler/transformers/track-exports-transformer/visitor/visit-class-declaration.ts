import {TS} from "../../../../../../type/ts.js";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options.js";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {hasExportModifier} from "../../../util/modifier-util.js";
import { getModifiers } from "../../../util/node-util.js";

export function visitClassDeclaration({node, typescript, markAsExported, ...options}: TrackExportsTransformerVisitorOptions<TS.ClassDeclaration>): void {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript) || node.name == null) return;

	const {exportedSymbol} = createExportSpecifierFromNameAndModifiers({
		...options,
		name: node.name.text,
		modifiers: getModifiers(node, typescript),
		typescript
	});

	// Also mark the node as exported so that we can track it later
	markAsExported(exportedSymbol);
}
