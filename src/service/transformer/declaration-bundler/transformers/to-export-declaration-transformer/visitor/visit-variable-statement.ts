import {TS} from "../../../../../../type/ts";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../util/modifier-util";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";
import {preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta";

export function visitVariableStatement(options: ToExportDeclarationTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, typescript, appendNodes} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	for (const declaration of node.declarationList.declarations) {
		const identifiers = traceIdentifiers({...options, node: declaration});

		for (const identifier of identifiers) {
			const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({
				...options,
				name: identifier,
				modifiers: node.modifiers
			});
			// Append an ExportDeclaration
			appendNodes(preserveParents(typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([exportSpecifier])), {typescript}));

			const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
			preserveSymbols(propertyName, declaration, options);
		}
	}

	return node;
}
