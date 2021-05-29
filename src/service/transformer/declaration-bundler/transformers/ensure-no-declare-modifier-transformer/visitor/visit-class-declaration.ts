import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitClassDeclaration(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.ClassDeclaration>): TS.ClassDeclaration {
	const {node, factory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		factory.updateClassDeclaration(node, node.decorators, removeDeclareModifier(node.modifiers, typescript), node.name, node.typeParameters, node.heritageClauses, node.members),
		node,
		options
	);
}
