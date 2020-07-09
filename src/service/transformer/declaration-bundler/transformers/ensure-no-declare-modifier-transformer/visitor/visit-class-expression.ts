import {TS} from "../../../../../../type/ts";
import {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util";
import {isNodeFactory} from "../../../util/is-node-factory";

export function visitClassExpression(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	const {node, compatFactory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(
		isNodeFactory(compatFactory)
			? compatFactory.updateClassExpression(
					node,
					node.decorators,
					removeDeclareModifier(node.modifiers, typescript),
					node.name,
					node.typeParameters,
					node.heritageClauses,
					node.members
			  )
			: compatFactory.updateClassExpression(node, removeDeclareModifier(node.modifiers, typescript), node.name, node.typeParameters, node.heritageClauses, node.members),
		node,
		options
	);
}
