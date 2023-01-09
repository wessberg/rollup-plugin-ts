import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import { getModifierLikes } from "../../../util/node-util.js";

export function visitClassExpression({node, continuation, factory}: TreeShakerVisitorOptions<TS.ClassExpression>): TS.ClassExpression | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	const modifierLikes = getModifierLikes(node);

	return node.name === nameContinuationResult
		? node
		: factory.updateClassExpression(node, modifierLikes, nameContinuationResult, node.typeParameters, node.heritageClauses, node.members);
}
