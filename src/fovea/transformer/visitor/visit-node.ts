import {ISourceFileContext} from "../i-source-file-context";
import {isClassDeclaration, Node, VisitResult, visitEachChild} from "typescript";
import {visitClass} from "./visit-class";
import {continuationMap} from "./continuation/continuation-map";
import {Continuation} from "./continuation/continuation";

/**
 * Gets a Continuation based on the given SourceFileContext.
 * If one exists already, it will be reused
 * @param {ISourceFileContext} context
 * @returns {Continuation}
 */
export function getContinuation<T extends Node> (context: ISourceFileContext): Continuation<T> {
	const existing = continuationMap.get(context);
	if (existing != null) return <Continuation<T>> existing;

	const continuation = (continuationNode: T) => visitEachChild(
		continuationNode,
		child => visitNode(child, context), context.transformationContext
	);

	continuationMap.set(context, continuation);
	return continuation;
}

/**
 * Visits the given Node within the given Context
 * @param {Node} node
 * @param {ISourceFileContext} context
 * @returns {VisitResult<Node>}
 */
export function visitNode<T extends Node> (node: T, context: ISourceFileContext): VisitResult<T> {

	// If it is a class, it might be relevant
	if (isClassDeclaration(node)) {
		return <VisitResult<T>>visitClass(node, context, getContinuation(context));
	}

	return <VisitResult<T>>getContinuation(context)(node);
}