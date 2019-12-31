import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitIdentifier({node, isReferenced}: TreeShakerVisitorOptions<TS.Identifier>): TS.Identifier | undefined {
	if (node != null && isReferenced(node)) {
		return node;
	}
	return undefined;
}
