import {createIdentifier, ImportSpecifier, updateImportSpecifier} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given ImportSpecifier.
 * @param {DeconflictVisitorOptions<ImportSpecifier>} options
 * @returns {VisitResult<ImportSpecifier>}
 */
export function deconflictImportSpecifier({
	node,
	continuation,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<ImportSpecifier>): ImportSpecifier | undefined {
	// For things like 'Foo as Bar', 'Foo' should never be rewritten.
	if (node.propertyName != null) {
		return childContinuation(node, {
			lValues: new Set([...lValues, node.propertyName]),
			lexicalIdentifiers
		});
	}

	const nameContinuationResult = continuation(node.name, {lValues, lexicalIdentifiers});

	// If the name is conflicting with a local binding, rewrite the ImportSpecifier from 'Foo' to 'Foo as Bar'
	if (nameContinuationResult !== node.name && nameContinuationResult != null) {
		return updateImportSpecifier(node, createIdentifier(node.name.text), createIdentifier(nameContinuationResult.text));
	}

	return node;
}
