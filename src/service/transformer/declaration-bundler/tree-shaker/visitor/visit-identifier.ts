import {Identifier} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitIdentifier({node, isReferenced}: TreeShakerVisitorOptions<Identifier>): Identifier | undefined {
	if (node != null && isReferenced(node)) {
		return node;
	}
	return undefined;
}
