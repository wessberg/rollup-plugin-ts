import type {IsReferencedOptions} from "./is-referenced-options.js";
import type {TS} from "../../../../../../type/ts.js";

export interface VisitorOptions<T extends TS.Node = TS.Node> extends IsReferencedOptions<T> {
	originalNode: TS.Node;
}
