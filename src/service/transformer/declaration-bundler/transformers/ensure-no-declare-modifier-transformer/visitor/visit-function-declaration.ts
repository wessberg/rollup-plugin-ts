import {TS} from "../../../../../../type/ts.js";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util.js";

export function visitFunctionDeclaration(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration {
	const {node, factory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		factory.updateFunctionDeclaration(
			node,
			node.decorators,
			removeDeclareModifier(node.modifiers, typescript),
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
