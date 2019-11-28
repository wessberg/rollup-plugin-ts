import {TS} from "../../../../../../type/ts";
import {ContinuationOptions, DeconflicterOptions} from "./deconflicter-options";

export interface DeconflicterVisitorOptions<T extends TS.Node> extends DeconflicterOptions {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U, options: ContinuationOptions): U;
	continuation<U extends TS.Node>(node: U, options: ContinuationOptions): U;
}
