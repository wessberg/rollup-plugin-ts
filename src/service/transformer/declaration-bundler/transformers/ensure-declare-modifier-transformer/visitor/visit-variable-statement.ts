import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";

export function visitVariableStatement(options: EnsureDeclareModifierTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		typescript.updateVariableStatement(node, ensureHasDeclareModifier(node.modifiers, typescript), node.declarationList),
		node,
		options
	);
}
