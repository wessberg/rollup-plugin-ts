import type {SafeNode} from "../../../../type/safe-node.js";
import type {TS} from "../../../../type/ts.js";
import {getOriginalNode} from "./get-original-node.js";

export function getOriginalSourceFile<T extends SafeNode>(node: T, currentSourceFile: TS.SourceFile, typescript: typeof TS): TS.SourceFile {
	const originalNode = getOriginalNode(node, typescript);
	let sourceFile: TS.SourceFile | undefined = originalNode.getSourceFile();
	if (sourceFile != null) return sourceFile;

	if (originalNode._parent != null) {
		if (originalNode._parent.kind === typescript.SyntaxKind.SourceFile) {
			return originalNode._parent as TS.SourceFile;
		}
		sourceFile = originalNode._parent?.getSourceFile();
	}
	return sourceFile ?? currentSourceFile;
}
