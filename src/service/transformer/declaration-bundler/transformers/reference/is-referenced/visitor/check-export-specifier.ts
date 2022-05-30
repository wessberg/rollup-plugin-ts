import {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import {TS} from "../../../../../../../type/ts.js";

export function checkExportSpecifier({node, continuation}: ReferenceVisitorOptions<TS.ExportSpecifier>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.propertyName != null) {
		referencedIdentifiers.push(...continuation(node.propertyName));
	} else if (node.propertyName == null) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	return referencedIdentifiers;
}
