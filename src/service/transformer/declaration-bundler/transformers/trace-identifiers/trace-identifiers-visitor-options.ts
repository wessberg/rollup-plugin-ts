import {TS} from "../../../../../type/ts";
import {Resolver} from "../../../../../util/resolve-id/resolver";

export interface TraceIdentifiersVisitorOptions<T extends TS.Node = TS.Node> {
	typescript: typeof TS;
	node: T;
	sourceFile: TS.SourceFile;
	resolver: Resolver;

	addIdentifier(name: string): void;
	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
}
