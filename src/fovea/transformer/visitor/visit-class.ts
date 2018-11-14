import {ISourceFileContext} from "../i-source-file-context";
import {ClassDeclaration, VisitResult} from "typescript";
import {Continuation} from "./continuation/continuation";

/**
 * Visits the given ClassDeclaration within the given Context
 * @param {ClassDeclaration} node
 * @param {ISourceFileContext} _context
 * @param {Visitor} continuation
 * @returns {VisitResult<ClassDeclaration>}
 */
export function visitClass (node: ClassDeclaration, _context: ISourceFileContext, continuation: Continuation<ClassDeclaration>): VisitResult<ClassDeclaration> {
	return continuation(node);
}