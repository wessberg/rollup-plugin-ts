import type {TS} from "../../../../../../type/ts.js";
import type {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options.js";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getModifierLikes} from "../../../util/node-util.js";

export function visitClassExpression(options: EnsureDeclareModifierTransformerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	const {node, typescript, factory} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	const modifierLikes = ensureHasDeclareModifier(getModifierLikes(node), factory, typescript);

	return preserveMeta(factory.updateClassExpression(node, modifierLikes, node.name, node.typeParameters, node.heritageClauses, node.members), node, options);
}
