import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitNamespaceImport({node, continuation, factory}: TreeShakerVisitorOptions<TS.NamespaceImport>): TS.NamespaceImport | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult ? node : factory.updateNamespaceImport(node, nameContinuationResult);
}
