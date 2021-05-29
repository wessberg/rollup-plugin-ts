import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitClassExpression(options: EnsureNoExportModifierTransformerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	const {node, factory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;

	return preserveMeta(
		factory.updateClassExpression(node, node.decorators, removeExportModifier(node.modifiers, typescript), node.name, node.typeParameters, node.heritageClauses, node.members),
		node,
		options
	);
}
