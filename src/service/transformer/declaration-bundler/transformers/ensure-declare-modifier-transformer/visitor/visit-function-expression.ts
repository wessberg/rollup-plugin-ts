import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";

export function visitFunctionExpression(options: EnsureDeclareModifierTransformerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression {
	const {node, compatFactory, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		compatFactory.updateFunctionExpression(
			node,
			ensureHasDeclareModifier(node.modifiers, compatFactory, typescript),
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
