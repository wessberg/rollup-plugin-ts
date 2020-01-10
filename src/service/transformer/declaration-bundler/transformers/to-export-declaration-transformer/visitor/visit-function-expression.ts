import {TS} from "../../../../../../type/ts";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options";
import {generateIdentifierName} from "../../../util/generate-identifier-name";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {preserveMeta, preserveSymbols} from "../../../util/clone-node-with-meta";
import {hasExportModifier} from "../../../util/modifier-util";

export function visitFunctionExpression(options: ToExportDeclarationTransformerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression {
	const {node, typescript, sourceFile, appendNodes} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const nameText = node.name == null ? generateIdentifierName(sourceFile.fileName, "function") : node.name.text;
	let returnNode: TS.FunctionExpression;
	const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({...options, name: nameText, modifiers: node.modifiers});

	// Append an ExportDeclaration
	appendNodes(typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([exportSpecifier])));

	// Update the name if it changed
	if (node.name != null && nameText === node.name.text) {
		returnNode = node;
	} else {
		returnNode = preserveMeta(
			typescript.updateFunctionExpression(
				node,
				node.modifiers,
				node.asteriskToken,
				typescript.createIdentifier(nameText),
				node.typeParameters,
				node.parameters,
				node.type,
				node.body
			),
			node,
			options
		);
	}

	const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
	preserveSymbols(propertyName, returnNode, options);

	return returnNode;
}
