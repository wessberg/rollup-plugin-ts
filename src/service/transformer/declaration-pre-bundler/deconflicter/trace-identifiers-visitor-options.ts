import {Node, SourceFile} from "typescript";
import {LocalSymbol} from "../declaration-pre-bundler-options";
import {Resolver} from "../../../../util/resolve-id/resolver";

export interface TraceIdentifiersVisitorOptions<T extends Node = Node> {
	node: T;
	sourceFile: SourceFile;
	resolver: Resolver;

	addIdentifier(name: string, localSymbol: LocalSymbol): void;
	childContinuation<U extends Node>(node: U): void;
	continuation<U extends Node>(node: U): void;
}
