import {TS} from "../../../../../../type/ts.js";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util.js";

export function visitVariableStatement(options: EnsureDeclareModifierTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, factory, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(factory.updateVariableStatement(node, ensureHasDeclareModifier(node.modifiers, factory, typescript), node.declarationList), node, options);
}
