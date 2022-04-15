import { SafeNode } from "../../../../type/safe-node";
import { TS } from "../../../../type/ts";
import { getOriginalNode } from "./get-original-node";

export function markAsInternalAlias<T extends TS.Node>(node: T, typescript: typeof TS): void {
	getOriginalNode(node as SafeNode, typescript)._internalAlias = true;
}

export function isNodeInternalAlias<T extends TS.Node>(node: T, typescript: typeof TS): boolean {
	return getOriginalNode(node as SafeNode, typescript)._internalAlias === true;
}