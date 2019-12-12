import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";

export function visitInterfaceDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.InterfaceDeclaration>): TS.InterfaceDeclaration {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateInterfaceDeclaration(
			node,
			node.decorators,
			removeDeclareModifier(node.modifiers, typescript),
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		),
		options
	);
}
