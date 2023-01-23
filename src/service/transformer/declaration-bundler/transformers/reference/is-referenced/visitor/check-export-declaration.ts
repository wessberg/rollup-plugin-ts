import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkExportDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ExportDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.exportClause != null) {
		referencedIdentifiers.push(...continuation(node.exportClause));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
