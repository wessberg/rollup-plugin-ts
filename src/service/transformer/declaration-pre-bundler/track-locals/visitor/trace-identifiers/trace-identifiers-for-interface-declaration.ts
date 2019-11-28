import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {normalize} from "path";
import {TS} from "../../../../../../type/ts";

/**
 * Traces identifiers for the given InterfaceDeclaration.
 */
export function traceIdentifiersForInterfaceDeclaration({node, sourceFile, addIdentifier}: TrackLocalsVisitorOptions<TS.InterfaceDeclaration>): void {
	addIdentifier(node.name.text, {
		originalModule: normalize(sourceFile.fileName)
	});
}
