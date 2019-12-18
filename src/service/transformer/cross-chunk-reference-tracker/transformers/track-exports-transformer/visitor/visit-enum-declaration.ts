import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../../declaration-bundler/util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../../declaration-bundler/util/modifier-util";

export function visitEnumDeclaration({
	node,
	typescript,
	markAsExported,
	...options
}: TrackExportsTransformerVisitorOptions<TS.EnumDeclaration>): void {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return;

	const {exportedSymbol} = createExportSpecifierFromNameAndModifiers({
		...options,
		name: node.name.text,
		modifiers: node.modifiers,
		typescript
	});

	// Also mark the node as exported so that we can track it later
	markAsExported(exportedSymbol);
}
