import {ImportSpecifier, updateImportSpecifier} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportSpecifier({node, continuation}: TreeShakerVisitorOptions<ImportSpecifier>): ImportSpecifier | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}

	return node.name === nameContinuationResult ? node : updateImportSpecifier(node, node.propertyName, nameContinuationResult);
}
