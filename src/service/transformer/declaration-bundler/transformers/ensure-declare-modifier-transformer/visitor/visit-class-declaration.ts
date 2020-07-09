import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";

export function visitClassDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.ClassDeclaration>): TS.ClassDeclaration {
	const {node, typescript, compatFactory} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		compatFactory.updateClassDeclaration(
			node,
			node.decorators,
			ensureHasDeclareModifier(node.modifiers, compatFactory, typescript),
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		),
		node,
		options
	);
}
