import {TS} from "../../../../../../type/ts";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options";
import {generateIdentifierName} from "../../../util/generate-identifier-name";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasExportModifier} from "../../../util/modifier-util";

export function visitFunctionDeclaration(options: ToExportDeclarationTransformerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration {
	const {node, typescript, sourceFile, appendNodes} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const nameText = node.name == null ? generateIdentifierName(sourceFile.fileName, "function") : node.name.text;
	const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({...options, name: nameText, modifiers: node.modifiers});

	// Append an ExportDeclaration
	appendNodes(typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([exportSpecifier]), undefined));

	// Update the name if it changed
	if (node.name != null && nameText === node.name.text) {
		return node;
	}

	return preserveSymbols(
		typescript.updateFunctionDeclaration(
			node,
			node.decorators,
			node.modifiers,
			node.asteriskToken,
			typescript.createIdentifier(nameText),
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		),
		options
	);
}
