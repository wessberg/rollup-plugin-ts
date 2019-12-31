import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitClassExpression(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	const {node, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateClassExpression(
			node,
			removeDeclareModifier(node.modifiers, typescript),
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		),
		options
	);
}
