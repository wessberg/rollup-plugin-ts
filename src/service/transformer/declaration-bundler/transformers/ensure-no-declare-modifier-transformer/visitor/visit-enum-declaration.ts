import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitEnumDeclaration(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	const {node, factory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(factory.updateEnumDeclaration(node, node.decorators, removeDeclareModifier(node.modifiers, typescript), node.name, node.members), node, options);
}
