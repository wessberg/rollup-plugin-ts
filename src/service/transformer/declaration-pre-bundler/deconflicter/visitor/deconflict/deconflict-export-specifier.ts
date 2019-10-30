import {createIdentifier, ExportSpecifier, updateExportSpecifier} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given ExportSpecifier.
 * @param {DeconflicterVisitorOptions<ExportSpecifier>} options
 * @returns {VisitResult<ExportSpecifier>}
 */
export function deconflictExportSpecifier({
	node,
	continuation,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<ExportSpecifier>): ExportSpecifier | undefined {
	// For things like 'Foo as Bar', 'Bar' should never be rewritten.
	if (node.propertyName != null) {
		return childContinuation(node, {
			lValues: new Set([...lValues, node.name]),
			lexicalIdentifiers
		});
	}

	const nameContinuationResult = continuation(node.name, {lValues, lexicalIdentifiers});

	// If the name is conflicting with a local binding, rewrite the ExportSpecifier from 'Foo' to 'Foo as Bar'
	if (nameContinuationResult !== node.name && nameContinuationResult != null) {
		return updateExportSpecifier(node, createIdentifier(nameContinuationResult.text), createIdentifier(node.name.text));
	}

	return node;
}
