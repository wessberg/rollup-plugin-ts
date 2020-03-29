import {TS} from "../../../../../../type/ts";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options";
import {generateIdentifierName} from "../../../util/generate-identifier-name";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {preserveMeta, preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta";
import {hasExportModifier} from "../../../util/modifier-util";

export function visitClassDeclaration(options: ToExportDeclarationTransformerVisitorOptions<TS.ClassDeclaration>): TS.ClassDeclaration {
	const {node, typescript, appendNodes, sourceFile} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const nameText = node.name == null ? generateIdentifierName(sourceFile.fileName, "class") : node.name.text;
	let returnNode: TS.ClassDeclaration;

	const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({
		...options,
		name: nameText,
		modifiers: node.modifiers
	});

	// Append an ExportDeclaration
	appendNodes(
		preserveParents(typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([exportSpecifier])), {typescript})
	);

	// Update the name if it changed
	if (node.name != null && nameText === node.name.text) {
		returnNode = node;
	} else {
		returnNode = preserveMeta(
			typescript.updateClassDeclaration(
				node,
				node.decorators,
				node.modifiers,
				typescript.createIdentifier(nameText),
				node.typeParameters,
				node.heritageClauses,
				node.members
			),
			node,
			options
		);
	}

	const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
	preserveSymbols(propertyName, returnNode, options);

	return returnNode;
}
