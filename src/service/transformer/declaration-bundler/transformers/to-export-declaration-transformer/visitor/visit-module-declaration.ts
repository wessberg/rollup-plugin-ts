import {TS} from "../../../../../../type/ts";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../util/modifier-util";
import {preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta";

export function visitModuleDeclaration(options: ToExportDeclarationTransformerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration {
	const {node, typescript, appendNodes} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({...options, name: node.name.text, modifiers: node.modifiers});

	// Append an ExportDeclaration
	appendNodes(preserveParents(typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([exportSpecifier])), {typescript}));

	const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
	preserveSymbols(propertyName, node, options);

	return node;
}
