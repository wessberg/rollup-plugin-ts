import {TS} from "../../../../type/ts";

export function nodeArraysAreEqual(a: TS.NodeArray<TS.Node> | TS.Node[] | undefined, b: TS.NodeArray<TS.Node> | TS.Node[] | undefined): boolean {
	if (a == null && b == null) return true;
	return a != null && b != null && a.length === b.length && a.every((element, index) => element === b[index]);
}
