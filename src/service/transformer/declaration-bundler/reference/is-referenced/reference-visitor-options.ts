import {Node} from "typescript";
import {VisitorOptions} from "./visitor-options";

export interface ReferenceVisitorOptions<T extends Node = Node> extends VisitorOptions<T> {
	continuation<U extends Node>(node: U): string[];
	childContinuation<U extends Node>(node: U): string[];
	markIdentifiersAsReferenced (fromNode: Node, ...identifiers: string[]): void;
}
