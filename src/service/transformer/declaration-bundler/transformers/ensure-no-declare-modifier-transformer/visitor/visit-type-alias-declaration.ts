import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitTypeAliasDeclaration(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration {
	const {node, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		typescript.updateTypeAliasDeclaration(node, node.decorators, removeDeclareModifier(node.modifiers, typescript), node.name, node.typeParameters, node.type),
		node,
		options
	);
}
