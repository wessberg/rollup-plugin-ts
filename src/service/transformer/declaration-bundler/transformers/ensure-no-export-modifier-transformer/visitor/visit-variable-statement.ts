import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitVariableStatement(options: EnsureNoExportModifierTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;

	return preserveSymbols(typescript.updateVariableStatement(node, removeExportModifier(node.modifiers, typescript), node.declarationList), options);
}
