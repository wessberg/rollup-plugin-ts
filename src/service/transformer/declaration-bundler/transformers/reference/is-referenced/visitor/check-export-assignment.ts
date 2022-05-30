import {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import {TS} from "../../../../../../../type/ts.js";

export function checkExportAssignment({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ExportAssignment>): string[] {
	const referencedIdentifiers = continuation(node.expression);

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
