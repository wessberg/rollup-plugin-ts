import type {TS} from "../../../../../../type/ts.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given ImportEqualsDeclaration.
 */
export function traceIdentifiersForImportEqualsDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.ImportEqualsDeclaration>): void {
	addIdentifier(node.name.text);
}
