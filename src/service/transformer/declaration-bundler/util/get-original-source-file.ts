import {SafeNode} from "../../../../type/safe-node";
import {TS} from "../../../../type/ts";
import {getOriginalNode} from "./get-original-node";

export function getOriginalSourceFile<T extends SafeNode>(node: T, currentSourceFile: TS.SourceFile, typescript: typeof TS, print = false): TS.SourceFile {
	const originalNode = getOriginalNode(node, typescript);
	let sourceFile: TS.SourceFile|undefined = originalNode.getSourceFile();
	if (sourceFile != null) return sourceFile;

	if (print) console.log(originalNode);

	if (originalNode._parent != null) {
		if (originalNode._parent.kind === typescript.SyntaxKind.SourceFile) {
			return originalNode._parent as TS.SourceFile;
		}
		sourceFile = originalNode._parent?.getSourceFile();
	}
	return sourceFile ?? currentSourceFile;
}
