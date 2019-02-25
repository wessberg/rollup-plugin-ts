import {Node} from "typescript";
import {ReferenceCache} from "../cache/reference-cache";

export interface IsReferencedOptions<T extends Node> {
	cache: ReferenceCache;
	seenNodes?: Set<Node>;
	node: T;
}
