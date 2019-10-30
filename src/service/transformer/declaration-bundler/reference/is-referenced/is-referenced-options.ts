import {Node} from "typescript";
import {ReferenceCache} from "../cache/reference-cache";
import {GetIdentifiersWithCacheOptions} from "../../util/get-identifiers-for-node";

export interface IsReferencedOptions<T extends Node> extends GetIdentifiersWithCacheOptions {
	referenceCache: ReferenceCache;
	seenNodes?: Set<Node>;
	node: T;
}
