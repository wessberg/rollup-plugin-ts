import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ExportSpecifier} from "typescript";

export function checkExportSpecifier({node, continuation}: ReferenceVisitorOptions<ExportSpecifier>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.propertyName != null) {
		referencedIdentifiers.push(...continuation(node.propertyName));
	}

	else if (node.propertyName == null) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	return referencedIdentifiers;
}
