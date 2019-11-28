import {TS} from "../../../../type/ts";

export interface ContinuationOptions {
	lexicalEnvironment: LexicalEnvironment;
}

export interface LexicalEnvironment {
	parent: LexicalEnvironment | undefined;
	bindings: Map<string, string>;
}

export interface DeconflicterVisitorOptions<T extends TS.Node = TS.Node> extends ContinuationOptions {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U, options: ContinuationOptions): U;
	continuation<U extends TS.Node>(node: U, options: ContinuationOptions): U;
}
