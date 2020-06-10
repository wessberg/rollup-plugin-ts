import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitVariableStatement(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(typescript.updateVariableStatement(node, removeDeclareModifier(node.modifiers, typescript), node.declarationList), node, options);
}
