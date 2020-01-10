import {SafeNode} from "../../../../type/safe-node";
import {TS} from "../../../../type/ts";

export function getOriginalNode<T extends SafeNode>(node: T, typescript: typeof TS): T {
	if (node._original != null) {
		return getOriginalNode(node._original as T, typescript);
	}

	return (typescript.getOriginalNode(node) as T) ?? node;
}
