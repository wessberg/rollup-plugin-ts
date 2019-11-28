import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {TS} from "../../../../../../type/ts";

/**
 * Deconflicts the given VariableDeclaration.
 */
export function traceIdentifiersForVariableDeclaration({node, continuation}: TrackLocalsVisitorOptions<TS.VariableDeclaration>): void {
	continuation(node.name);
}
