import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {normalize} from "path";
import {TS} from "../../../../../../type/ts";

/**
 * Traces identifiers for the given EnumDeclaration.
 */
export function traceIdentifiersForEnumDeclaration({node, sourceFile, addIdentifier}: TrackLocalsVisitorOptions<TS.EnumDeclaration>): void {
	addIdentifier(node.name.text, {
		originalModule: normalize(sourceFile.fileName)
	});
}
