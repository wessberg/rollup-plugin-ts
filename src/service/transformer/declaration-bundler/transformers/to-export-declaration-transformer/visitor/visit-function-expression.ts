import type {TS} from "../../../../../../type/ts.js";
import type {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options.js";
import {generateIdentifierName} from "../../../util/generate-identifier-name.js";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {preserveMeta, preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta.js";
import {hasExportModifier} from "../../../util/modifier-util.js";

export function visitFunctionExpression(options: ToExportDeclarationTransformerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression {
	const {node, factory, typescript, sourceFile, appendNodes} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const nameText = node.name == null ? generateIdentifierName(sourceFile.fileName, "function") : node.name.text;
	let returnNode: TS.FunctionExpression;
	const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({...options, name: nameText, modifiers: node.modifiers});

	// Append an ExportDeclaration
	appendNodes(preserveParents(factory.createExportDeclaration(undefined, false, factory.createNamedExports([exportSpecifier])), {typescript}));

	// Update the name if it changed
	if (node.name != null && nameText === node.name.text) {
		returnNode = node;
	} else {
		returnNode = preserveMeta(
			factory.updateFunctionExpression(node, node.modifiers, node.asteriskToken, factory.createIdentifier(nameText), node.typeParameters, node.parameters, node.type, node.body),
			node,
			options
		);
	}

	const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
	preserveSymbols(propertyName, returnNode, options);

	return returnNode;
}
