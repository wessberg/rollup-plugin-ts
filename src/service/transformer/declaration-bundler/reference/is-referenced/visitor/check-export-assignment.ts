import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ExportAssignment} from "typescript";

export function checkExportAssignment({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<ExportAssignment>): string[] {
	const referencedIdentifiers = continuation(node.expression);

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
