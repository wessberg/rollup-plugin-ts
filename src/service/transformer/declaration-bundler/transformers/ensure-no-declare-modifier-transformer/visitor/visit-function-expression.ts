import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitFunctionExpression(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression {
	const {node, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateFunctionExpression(
			node,
			removeDeclareModifier(node.modifiers, typescript),
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		),
		options
	);
}
