import {SafeNode} from "../../../../type/safe-node.js";
import {TS} from "../../../../type/ts.js";
import {getOriginalNode} from "./get-original-node.js";

export function markAsInternalAlias<T extends TS.Node>(node: T, typescript: typeof TS): void {
	getOriginalNode(node as SafeNode, typescript)._internalAlias = true;
}

export function isNodeInternalAlias<T extends TS.Node>(node: T, typescript: typeof TS): boolean {
	return getOriginalNode(node as SafeNode, typescript)._internalAlias === true;
}
