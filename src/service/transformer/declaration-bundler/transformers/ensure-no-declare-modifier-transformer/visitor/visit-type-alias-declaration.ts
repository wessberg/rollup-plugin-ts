import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitTypeAliasDeclaration(
	options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.TypeAliasDeclaration>
): TS.TypeAliasDeclaration {
	const {node, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateTypeAliasDeclaration(
			node,
			node.decorators,
			removeDeclareModifier(node.modifiers, typescript),
			node.name,
			node.typeParameters,
			node.type
		),
		options
	);
}
