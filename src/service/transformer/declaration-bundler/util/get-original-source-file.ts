import {SafeNode} from "../../../../type/safe-node";
import {TS} from "../../../../type/ts";
import {getOriginalNode} from "./get-original-node";

export function getOriginalSourceFile<T extends SafeNode>(node: T, currentSourceFile: TS.SourceFile, typescript: typeof TS): TS.SourceFile {
	return getOriginalNode(node, typescript).getSourceFile() ?? currentSourceFile;
}
