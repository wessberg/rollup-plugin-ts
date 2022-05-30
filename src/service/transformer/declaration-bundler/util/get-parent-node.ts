import {SafeNode} from "../../../../type/safe-node.js";

export function getParentNode<T extends SafeNode>(node: T): T["parent"] {
	if (node._parent != null) {
		return node._parent as T["parent"];
	}

	return node.parent;
}

export function setParentNode<T extends SafeNode>(node: T, parentNode: T["parent"]): T {
	node._parent = parentNode;
	return node;
}
