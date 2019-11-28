import {IsReferencedOptions} from "./is-referenced-options";
import {TS} from "../../../../../type/ts";

export interface VisitorOptions<T extends TS.Node = TS.Node> extends IsReferencedOptions<T> {
	originalNode: TS.Node;
}
