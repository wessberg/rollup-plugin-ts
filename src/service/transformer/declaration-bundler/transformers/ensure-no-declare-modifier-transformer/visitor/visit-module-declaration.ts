import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitModuleDeclaration(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration {
	const {node, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(typescript.updateModuleDeclaration(node, node.decorators, removeDeclareModifier(node.modifiers, typescript), node.name, node.body), node, options);
}
