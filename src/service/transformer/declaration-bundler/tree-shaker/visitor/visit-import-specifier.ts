import {ImportSpecifier} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportSpecifier({node, isReferenced}: TreeShakerVisitorOptions<ImportSpecifier>): ImportSpecifier | undefined {
	if (isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
