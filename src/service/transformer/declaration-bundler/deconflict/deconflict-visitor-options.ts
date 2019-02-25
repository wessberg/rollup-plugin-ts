import {Identifier, Node, VisitResult} from "typescript";

export interface DeconflictVisitorOptions<T extends Node = Node> {
	node: T;

	updateIdentifierIfNeeded<U extends Identifier | undefined>(identifier: U): U extends undefined ? undefined : Identifier;
	continuation<U extends Node>(node: U): VisitResult<U>;
}
