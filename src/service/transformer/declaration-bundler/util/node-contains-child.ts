import type {TS} from "../../../../type/ts.js";
import {getParentNode} from "./get-parent-node.js";

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
