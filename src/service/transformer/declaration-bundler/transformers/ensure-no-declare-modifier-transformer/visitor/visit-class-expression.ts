import type {TS} from "../../../../../../type/ts.js";
import type {EnsureNoDeclareModifierTransformerVisitorOptions} from "../ensure-no-declare-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {hasDeclareModifier, removeDeclareModifier} from "../../../util/modifier-util.js";
import {getModifierLikes} from "../../../util/node-util.js";

export function visitClassExpression(options: EnsureNoDeclareModifierTransformerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	const {node, factory, typescript} = options;
	if (!hasDeclareModifier(node, typescript)) return node;

	const modifierLikes = removeDeclareModifier(getModifierLikes(node), typescript);

	return preserveMeta(factory.updateClassExpression(node, modifierLikes, node.name, node.typeParameters, node.heritageClauses, node.members), node, options);
}
