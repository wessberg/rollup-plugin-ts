import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

export function visitFunctionDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateFunctionDeclaration(
			node,
			node.decorators,
			ensureHasDeclareModifier(node.modifiers, typescript),
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		),
		options
	);
}
