import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {normalize} from "path";
import {TS} from "../../../../../../type/ts";

/**
 * Traces identifiers for the given ClassDeclaration.
 */
export function traceIdentifiersForClassDeclaration({node, sourceFile, addIdentifier}: TrackLocalsVisitorOptions<TS.ClassDeclaration>): void {
	if (node.name == null) return;

	addIdentifier(node.name.text, {
		originalModule: normalize(sourceFile.fileName)
	});
}
