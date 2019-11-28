import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {normalize} from "path";
import {TS} from "../../../../../../type/ts";

/**
 * Traces identifiers for the given ImportSpecifier.
 */
export function traceIdentifiersForImportSpecifier({
	node,
	sourceFile,
	resolver,
	addIdentifier,
	typescript
}: TrackLocalsVisitorOptions<TS.ImportSpecifier>): void {
	const moduleSpecifier =
		node.parent == null || node.parent.parent == null || node.parent.parent.parent == null ? undefined : node.parent.parent.parent.moduleSpecifier;

	addIdentifier(node.name.text, {
		originalModule: normalize(
			moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier)
				? sourceFile.fileName
				: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
		)
	});
}
