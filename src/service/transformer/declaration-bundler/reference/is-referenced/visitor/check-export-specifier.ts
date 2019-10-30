import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ExportSpecifier} from "typescript";

export function checkExportSpecifier({node, continuation}: ReferenceVisitorOptions<ExportSpecifier>): boolean {
	if (node.propertyName != null && continuation(node.propertyName)) return true;
	if (node.propertyName == null && continuation(node.name)) return true;
	return false;
}
