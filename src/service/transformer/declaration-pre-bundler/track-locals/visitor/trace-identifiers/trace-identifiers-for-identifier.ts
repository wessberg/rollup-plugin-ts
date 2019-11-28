import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {normalize} from "path";
import {TS} from "../../../../../../type/ts";

/**
 * Deconflicts the given Identifier.
 */
export function traceIdentifiersForIdentifier({node, sourceFile, addIdentifier}: TrackLocalsVisitorOptions<TS.Identifier>): void {
	addIdentifier(node.text, {
		originalModule: normalize(sourceFile.fileName)
	});
}
