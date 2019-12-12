import {TS} from "../../../../../../type/ts";
import {ToExportDeclarationTransformerVisitorOptions} from "../to-export-declaration-transformer-visitor-options";
import {createExportSpecifierFromNameAndModifiers} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {hasExportModifier} from "../../../util/modifier-util";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";

export function visitVariableStatement(options: ToExportDeclarationTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, typescript, appendNodes} = options;
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	const identifiers = traceIdentifiers(options);

	for (const identifier of identifiers) {
		const {exportSpecifier} = createExportSpecifierFromNameAndModifiers({
			...options,
			name: identifier,
			modifiers: node.modifiers
		});
		// Append an ExportDeclaration
		appendNodes(typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports([exportSpecifier]), undefined));
	}

	return node;
}
