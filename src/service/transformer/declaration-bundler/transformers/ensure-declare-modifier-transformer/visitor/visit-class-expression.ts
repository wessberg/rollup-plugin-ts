import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

export function visitClassExpression(options: EnsureDeclareModifierTransformerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateClassExpression(
			node,
			ensureHasDeclareModifier(node.modifiers, typescript),
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		),
		options
	);
}
