import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {normalize} from "path";
import {TS} from "../../../../../../type/ts";

/**
 * Traces identifiers for the given NamespaceImport.
 */
export function traceIdentifiersForNamespaceImport({
	node,
	sourceFile,
	resolver,
	addIdentifier,
	typescript
}: TrackLocalsVisitorOptions<TS.NamespaceImport>): void {
	const moduleSpecifier = node.parent == null || node.parent.parent == null ? undefined : node.parent.parent.moduleSpecifier;

	if (node.name != null) {
		addIdentifier(node.name.text, {
			originalModule: normalize(
				moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier)
					? sourceFile.fileName
					: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
			)
		});
	}
}
