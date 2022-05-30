import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitIdentifier({node, isReferenced}: TreeShakerVisitorOptions<TS.Identifier>): TS.Identifier | undefined {
	if (node != null && isReferenced(node)) {
		return node;
	}
	return undefined;
}
