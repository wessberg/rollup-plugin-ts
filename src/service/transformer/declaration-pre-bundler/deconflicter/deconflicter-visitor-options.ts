import {Identifier, Node} from "typescript";

export interface ContinuationOptions {
	lValues: Set<Identifier>;
	lexicalIdentifiers: Set<string>;
}

export interface DeconflicterVisitorOptions<T extends Node = Node> {
	node: T;
	lValues: Set<Identifier>;
	lexicalIdentifiers: Set<string>;

	updateIdentifierIfNeeded(identifier: Identifier, options: ContinuationOptions): Identifier;
	childContinuation<U extends Node>(node: U, options: ContinuationOptions): U | undefined;
	continuation<U extends Node>(node: U, options: ContinuationOptions): U | undefined;
}
