import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ImportSpecifier.
 */
export function traceIdentifiersForImportSpecifier({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.ImportSpecifier>): void {
	addIdentifier(node.name.text);
}
