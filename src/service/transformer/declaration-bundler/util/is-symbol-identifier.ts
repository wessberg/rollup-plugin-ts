import {TS} from "../../../../type/ts";

export function isSymbolIdentifier(node: TS.Node, typescript: typeof TS): node is TS.Identifier {
	return typescript.isIdentifier(node) && node.text.startsWith("[") && node.text.endsWith("]");
}
