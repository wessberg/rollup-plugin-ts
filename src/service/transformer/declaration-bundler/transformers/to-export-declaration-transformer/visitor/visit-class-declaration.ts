import type {TS} from "../../../../../../type/ts.js";
import type {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options.js";
import {generateIdentifierName} from "../../../util/generate-identifier-name.js";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers.js";
import {preserveMeta, preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta.js";
import {hasExportModifier} from "../../../util/modifier-util.js";
import {getModifierLikes, getModifiers} from "../../../util/node-util.js";

export function visitClassDeclaration(options: ToExportDeclarationTransformerVisitorOptions<TS.ClassDeclaration>): TS.ClassDeclaration {
	const {node, factory, typescript, appendNodes, sourceFile} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const nameText = node.name == null ? generateIdentifierName(sourceFile.fileName, "class") : node.name.text;
	let returnNode: TS.ClassDeclaration;

	const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({
		...options,
		name: nameText,
		modifiers: getModifiers(node, typescript)
	});

	// Append an ExportDeclaration
	appendNodes(preserveParents(factory.createExportDeclaration(undefined, false, factory.createNamedExports([exportSpecifier])), {typescript}));

	// Update the name if it changed
	if (node.name != null && nameText === node.name.text) {
		returnNode = node;
	} else {
		const modifierLikes = getModifierLikes(node);
		returnNode = preserveMeta(
			factory.updateClassDeclaration(node, modifierLikes, factory.createIdentifier(nameText), node.typeParameters, node.heritageClauses, node.members),
			node,
			options
		);
	}

	const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
	preserveSymbols(propertyName, returnNode, options);

	return returnNode;
}
