import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitTypeAliasDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration {
	const {node, compatFactory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		compatFactory.updateTypeAliasDeclaration(node, node.decorators, removeDeclareModifier(node.modifiers, typescript), node.name, node.typeParameters, node.type),
		node,
		options
	);
}
