import {NamespaceImport, updateNamespaceImport} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitNamespaceImport ({node, continuation}: TreeShakerVisitorOptions<NamespaceImport>): NamespaceImport|undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateNamespaceImport(
			node,
			nameContinuationResult
		);
}
