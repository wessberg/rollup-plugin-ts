import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ImportDeclaration.
 */
export function visitImportDeclaration({
	node,
	childContinuation,
	setCurrentModuleSpecifier
}: TrackImportsVisitorOptions<TS.ImportDeclaration>): TS.ImportDeclaration | undefined {
	// Visit all children, but leave out the import
	setCurrentModuleSpecifier(node.moduleSpecifier);
	childContinuation(node);
	return undefined;
}
