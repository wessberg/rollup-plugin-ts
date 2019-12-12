import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkExportDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ExportDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.exportClause != null) {
		referencedIdentifiers.push(...continuation(node.exportClause));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
