import {ImportDeclaration} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";

/**
 * Visits the given ImportDeclaration.
 * @param {TrackImportsVisitorOptions<ImportDeclaration>} options
 * @returns {ImportDeclaration | undefined}
 */
export function visitImportDeclaration({node, childContinuation}: TrackImportsVisitorOptions<ImportDeclaration>): ImportDeclaration | undefined {
	// Visit all children, but leave out the import
	childContinuation(node);
	return undefined;
}
