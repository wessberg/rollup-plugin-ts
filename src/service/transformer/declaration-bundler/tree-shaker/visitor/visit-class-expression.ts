import {ClassExpression} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitClassExpression ({node, isReferenced}: TreeShakerVisitorOptions<ClassExpression>): ClassExpression|undefined {
	if (node.name != null && isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
