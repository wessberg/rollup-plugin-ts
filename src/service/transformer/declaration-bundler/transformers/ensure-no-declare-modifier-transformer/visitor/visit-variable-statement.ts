import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitVariableStatement(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(typescript.updateVariableStatement(node, removeDeclareModifier(node.modifiers, typescript), node.declarationList), options);
}
