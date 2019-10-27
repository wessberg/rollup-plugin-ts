import {ImportSpecifier} from "typescript";
import {DeclarationTreeShakerVisitorOptions} from "../declaration-tree-shaker-visitor-options";

export function visitImportSpecifier({node, isReferenced}: DeclarationTreeShakerVisitorOptions<ImportSpecifier>): ImportSpecifier | undefined {
	if (isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
