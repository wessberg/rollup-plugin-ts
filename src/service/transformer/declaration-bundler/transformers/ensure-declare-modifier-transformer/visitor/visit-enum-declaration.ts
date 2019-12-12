import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

export function visitEnumDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateEnumDeclaration(node, node.decorators, removeDeclareModifier(node.modifiers, typescript), node.name, node.members),
		options
	);
}
