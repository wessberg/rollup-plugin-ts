import {TS} from "../../../../type/ts";
import {getParentNode} from "./get-parent-node";

/**
 * Returns true if the given Node contains the given Child Node
 */
export function nodeContainsChild(parent: TS.Node, potentialChild: TS.Node): boolean {
	if (parent === potentialChild) return false;

	let candidate = potentialChild;
	while (candidate != null) {
		candidate = getParentNode(candidate);
		if (candidate === parent) return true;
	}

	return false;
}
