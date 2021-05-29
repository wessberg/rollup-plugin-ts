import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";
import {preserveMeta} from "../../../util/clone-node-with-meta";

export function visitEnumDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	const {node, factory, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(factory.updateEnumDeclaration(node, node.decorators, ensureHasDeclareModifier(node.modifiers, factory, typescript), node.name, node.members), node, options);
}
