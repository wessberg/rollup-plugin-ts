import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitTypeAliasDeclaration(options: EnsureNoExportModifierTransformerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration {
	const {node, compatFactory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;
	return preserveMeta(
		compatFactory.updateTypeAliasDeclaration(node, node.decorators, removeExportModifier(node.modifiers, typescript), node.name, node.typeParameters, node.type),
		node,
		options
	);
}
