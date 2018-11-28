import {SourceFileContext} from "../../shared/i-source-file-context";
import {forEachChild, isClassDeclaration, Node, visitEachChild, VisitResult} from "typescript";
import {visitClass} from "../class/visit-class";
import {continuationMap} from "../../interpreter/continuation/continuation-map";
import {Continuation} from "../../interpreter/continuation/continuation";
import {SourceFileContextKind} from "../../shared/source-file-context-kind";

/**
 * Gets a Continuation based on the given SourceFileContext.
 * If one exists already, it will be reused
 * @param {SourceFileContext} context
 * @returns {Continuation}
 */
export function getContinuation<T extends Node> (context: SourceFileContext): Continuation<T> {
	const existing = continuationMap.get(context);
	if (existing != null) return <Continuation<T>> existing;

	const continuation = (continuationNode: T) => (
		context.kind === SourceFileContextKind.TRANSFORMER
			? visitEachChild(continuationNode, child => visitNode(child, context), context.transformationContext)
			: forEachChild<T>(continuationNode, (child) => <T|undefined> visitNode(child, context))
	);

	continuationMap.set(context, continuation);
	return continuation;
}

/**
 * Visits the given Node within the given Context
 * @param {Node} node
 * @param {SourceFileContext} context
 * @returns {VisitResult<Node>}
 */
export function visitNode<T extends Node> (node: T, context: SourceFileContext): VisitResult<T> {

	// If it is a class, it might be relevant
	if (isClassDeclaration(node)) {
		return <VisitResult<T>>visitClass(node, context, getContinuation(context));
	}

	return <VisitResult<T>>getContinuation(context)(node);
}