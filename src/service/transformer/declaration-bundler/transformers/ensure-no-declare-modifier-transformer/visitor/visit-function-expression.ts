import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitFunctionExpression(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression {
	const {node, factory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		factory.updateFunctionExpression(
			node,
			removeDeclareModifier(node.modifiers, typescript),
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
