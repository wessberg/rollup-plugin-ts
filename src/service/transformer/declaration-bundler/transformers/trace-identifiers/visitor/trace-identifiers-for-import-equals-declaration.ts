import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ImportEqualsDeclaration.
 */
export function traceIdentifiersForImportEqualsDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.ImportEqualsDeclaration>): void {
	addIdentifier(node.name.text);
}
