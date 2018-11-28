import {ClassDeclaration, ClassExpression, VisitResult} from "typescript";
import {Continuation} from "../../interpreter/continuation/continuation";
import {shouldTransformClass} from "../../util/class/should-transform-class/should-transform-class";
import {SourceFileContext} from "../../shared/i-source-file-context";

/**
 * Visits the given ClassDeclaration or ClassExpression within the given Context
 * @param {ClassDeclaration|ClassExpression} node
 * @param {SourceFileContext} context
 * @param {Visitor} continuation
 * @returns {VisitResult<ClassDeclaration|ClassExpression>}
 */
export function visitClass (node: ClassDeclaration|ClassExpression, context: SourceFileContext, continuation: Continuation<ClassDeclaration|ClassExpression>): VisitResult<ClassDeclaration|ClassExpression> {
	if (!shouldTransformClass({node, context})) return node;

	console.log("Yup, should look at class");
	return continuation(node);
}