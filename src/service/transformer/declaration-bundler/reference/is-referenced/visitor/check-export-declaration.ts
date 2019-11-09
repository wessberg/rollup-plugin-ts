import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ExportDeclaration} from "typescript";

export function checkExportDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<ExportDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.exportClause != null) {
		referencedIdentifiers.push(...continuation(node.exportClause));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
