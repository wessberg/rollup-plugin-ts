import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";

export function visitModuleDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		typescript.updateModuleDeclaration(node, node.decorators, ensureHasDeclareModifier(node.modifiers, typescript), node.name, node.body),
		node,
		options
	);
}
