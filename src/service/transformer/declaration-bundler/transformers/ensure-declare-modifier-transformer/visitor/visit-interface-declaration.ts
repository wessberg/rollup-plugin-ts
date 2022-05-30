import {TS} from "../../../../../../type/ts.js";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util.js";

export function visitInterfaceDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.InterfaceDeclaration>): TS.InterfaceDeclaration {
	const {node, factory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		factory.updateInterfaceDeclaration(
			node,
			node.decorators,
			removeDeclareModifier(node.modifiers, typescript),
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		),
		node,
		options
	);
}
