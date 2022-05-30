import {TS} from "../../../../../../type/ts.js";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given InterfaceDeclaration.
 */
export function traceIdentifiersForInterfaceDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.InterfaceDeclaration>): void {
	addIdentifier(node.name.text);
}
