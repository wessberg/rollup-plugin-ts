import {IsReferencedOptions} from "./is-referenced-options.js";
import {TS} from "../../../../../../type/ts.js";

export interface VisitorOptions<T extends TS.Node = TS.Node> extends IsReferencedOptions<T> {
	originalNode: TS.Node;
}
