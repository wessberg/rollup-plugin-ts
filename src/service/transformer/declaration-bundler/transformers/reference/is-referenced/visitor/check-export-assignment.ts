import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkExportAssignment({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ExportAssignment>): string[] {
	const referencedIdentifiers = continuation(node.expression);

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
