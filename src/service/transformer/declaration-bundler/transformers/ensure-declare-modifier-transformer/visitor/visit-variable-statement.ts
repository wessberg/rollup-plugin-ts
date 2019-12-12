import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";

export function visitVariableStatement(options: EnsureDeclareModifierTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateVariableStatement(node, ensureHasDeclareModifier(node.modifiers, typescript), node.declarationList),
		options
	);
}
