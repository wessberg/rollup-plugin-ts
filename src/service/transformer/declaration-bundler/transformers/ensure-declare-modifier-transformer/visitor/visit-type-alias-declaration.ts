import type {TS} from "../../../../../../type/ts.js";
import type {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util.js";

export function visitTypeAliasDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration {
	const {node, factory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	return preserveMeta(factory.updateTypeAliasDeclaration(node, removeDeclareModifier(node.modifiers, typescript), node.name, node.typeParameters, node.type), node, options);
}
