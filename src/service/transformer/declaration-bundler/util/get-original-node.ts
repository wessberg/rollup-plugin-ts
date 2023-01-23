import type {SafeNode} from "../../../../type/safe-node.js";
import type {TS} from "../../../../type/ts.js";

export function getOriginalNode<T extends SafeNode>(node: T, typescript: typeof TS): T {
	if (node._original != null) {
		return getOriginalNode(node._original as T, typescript);
	}

	return (typescript.getOriginalNode(node) as T) ?? node;
}
