import {LocalSymbol} from "../declaration-pre-bundler-options";
import {Resolver} from "../../../../util/resolve-id/resolver";
import {TS} from "../../../../type/ts";

export interface TrackLocalsVisitorOptions<T extends TS.Node = TS.Node> {
	typescript: typeof TS;
	node: T;
	sourceFile: TS.SourceFile;
	resolver: Resolver;

	addIdentifier(name: string, localSymbol: LocalSymbol): void;
	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
}
