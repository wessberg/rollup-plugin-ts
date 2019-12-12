import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given InterfaceDeclaration.
 */
export function traceIdentifiersForInterfaceDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.InterfaceDeclaration>): void {
	addIdentifier(node.name.text);
}
