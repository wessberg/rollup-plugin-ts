import {Node} from "typescript";

export interface TraceIdentifiersVisitorOptions<T extends Node = Node> {
	node: T;

	updateIdentifierName(oldName: string, newName: string): void;
	addIdentifier(name: string): void;

	continuation<U extends Node>(node: U): void;

	isIdentifierFree(identifier: string): boolean;
	generateUniqueVariableName(candidate: string): string;
}
