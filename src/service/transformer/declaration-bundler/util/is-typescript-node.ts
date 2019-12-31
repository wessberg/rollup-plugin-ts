import {TS} from "../../../../type/ts";

export function isTypescriptNode(item: unknown): item is TS.Node {
	return typeof item === "object" && item != null && "getSourceFile" in item;
}
