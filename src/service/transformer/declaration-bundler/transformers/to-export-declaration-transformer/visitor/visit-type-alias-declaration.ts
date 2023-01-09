import {TS} from "../../../../../../type/ts.js";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options.js";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {hasExportModifier} from "../../../util/modifier-util.js";
import {preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta.js";

export function visitTypeAliasDeclaration(options: ToExportDeclarationTransformerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration {
	const {node, factory, typescript, appendNodes} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({...options, name: node.name.text, modifiers: node.modifiers});

	// Append an ExportDeclaration
	appendNodes(preserveParents(factory.createExportDeclaration(undefined, false, factory.createNamedExports([exportSpecifier])), {typescript}));

	const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
	preserveSymbols(propertyName, node, options);

	return node;
}
