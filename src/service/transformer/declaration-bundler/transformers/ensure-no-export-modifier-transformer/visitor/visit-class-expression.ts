import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";
import {isNodeFactory} from "../../../util/is-node-factory";

export function visitClassExpression(options: EnsureNoExportModifierTransformerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	const {node, compatFactory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;

	return preserveMeta(
		isNodeFactory(compatFactory)
			? compatFactory.updateClassExpression(
					node,
					node.decorators,
					removeExportModifier(node.modifiers, typescript),
					node.name,
					node.typeParameters,
					node.heritageClauses,
					node.members
			  )
			: compatFactory.updateClassExpression(node, removeExportModifier(node.modifiers, typescript), node.name, node.typeParameters, node.heritageClauses, node.members),
		node,
		options
	);
}
