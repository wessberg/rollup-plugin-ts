import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ImportSpecifier} from "typescript";

export function checkImportSpecifier({node, continuation}: ReferenceVisitorOptions<ImportSpecifier>): boolean {
	if (continuation(node.name)) return true;
	return false;
}
