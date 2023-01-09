import {TS} from "../../../../../../type/ts.js";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options.js";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

export function visitEnumDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	const {node, factory, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(factory.updateEnumDeclaration(node, ensureHasDeclareModifier(node.modifiers, factory, typescript), node.name, node.members), node, options);
}
