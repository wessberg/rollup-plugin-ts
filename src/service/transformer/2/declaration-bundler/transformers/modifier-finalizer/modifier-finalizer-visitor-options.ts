import {TS} from "../../../../../../type/ts";

export interface ModifierFinalizerVisitorOptions<T extends TS.Node> {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): U;
	continuation<U extends TS.Node>(node: U): U;
}
