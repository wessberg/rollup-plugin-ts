import type {TS} from "../../../../../../type/ts.js";
import type {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util.js";

export function visitTypeAliasDeclaration(options: EnsureNoExportModifierTransformerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration {
	const {node, factory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;
	return preserveMeta(factory.updateTypeAliasDeclaration(node, removeExportModifier(node.modifiers, typescript), node.name, node.typeParameters, node.type), node, options);
}
