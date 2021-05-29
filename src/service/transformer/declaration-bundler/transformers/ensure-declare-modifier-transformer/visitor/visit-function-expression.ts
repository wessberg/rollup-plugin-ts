import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";

export function visitFunctionExpression(options: EnsureDeclareModifierTransformerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression {
	const {node, factory, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		factory.updateFunctionExpression(
			node,
			ensureHasDeclareModifier(node.modifiers, factory, typescript),
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		),
		node,
		options
	);
}
