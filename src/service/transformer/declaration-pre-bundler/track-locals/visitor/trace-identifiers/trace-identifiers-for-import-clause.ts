import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {normalize} from "path";
import {TS} from "../../../../../../type/ts";

/**
 * Traces identifiers for the given ImportClause.
 */
export function traceIdentifiersForImportClause({
	node,
	sourceFile,
	resolver,
	addIdentifier,
	continuation,
	typescript
}: TrackLocalsVisitorOptions<TS.ImportClause>): void {
	const moduleSpecifier = node.parent == null ? undefined : node.parent.moduleSpecifier;
	if (node.name != null) {
		addIdentifier(node.name.text, {
			originalModule: normalize(
				moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier)
					? sourceFile.fileName
					: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
			)
		});
	}

	if (node.namedBindings != null) {
		return continuation(node.namedBindings);
	}
}
