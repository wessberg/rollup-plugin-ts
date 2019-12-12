import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../util/modifier-util";

export function visitEnumDeclaration({
	node,
	typescript,
	lexicalEnvironment,
	markAsExported,
	...options
}: TrackExportsTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const {exportedSymbol} = createExportSpecifierFromNameAndModifiers({
		...options,
		name: node.name.text,
		modifiers: node.modifiers,
		lexicalEnvironment,
		typescript
	});

	// Also mark the node as exported so that we can track it later
	markAsExported(exportedSymbol);

	return node;
}
