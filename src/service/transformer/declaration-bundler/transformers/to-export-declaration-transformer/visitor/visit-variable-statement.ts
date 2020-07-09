import {TS} from "../../../../../../type/ts";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../util/modifier-util";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";
import {preserveParents, preserveSymbols} from "../../../util/clone-node-with-meta";
import {isNodeFactory} from "../../../util/is-node-factory";

export function visitVariableStatement(options: ToExportDeclarationTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, compatFactory, typescript, appendNodes} = options;
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
			appendNodes(
				preserveParents(
					isNodeFactory(compatFactory)
						? compatFactory.createExportDeclaration(undefined, undefined, false, compatFactory.createNamedExports([exportSpecifier]))
						: compatFactory.createExportDeclaration(undefined, undefined, compatFactory.createNamedExports([exportSpecifier])),
					{typescript}
				)
			);

			const propertyName = exportSpecifier.propertyName ?? exportSpecifier.name;
			preserveSymbols(propertyName, declaration, options);
		}
	}

	return node;
}
