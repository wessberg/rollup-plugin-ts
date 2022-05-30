import {TS} from "../../../../../../type/ts.js";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options.js";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

export function visitFunctionDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration {
	const {node, factory, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		factory.updateFunctionDeclaration(
			node,
			node.decorators,
			ensureHasDeclareModifier(node.modifiers, factory, typescript),
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		),
		node,
		options
	);
}
