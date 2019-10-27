import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ImportSpecifier} from "typescript";

export function checkImportSpecifier({node, childContinuation}: ReferenceVisitorOptions<ImportSpecifier>): boolean {
	if (childContinuation(node.name)) return true;
	return false;
}
