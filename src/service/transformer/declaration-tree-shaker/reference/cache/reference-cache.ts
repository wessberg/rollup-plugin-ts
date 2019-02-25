import {Node} from "typescript";
import {WeakMultiMap} from "../../../../../lib/multi-map/weak-multi-map";

export interface ReferenceCache {
	identifiersForNodeCache: WeakMultiMap<Node, string>;
	hasReferencesCache: WeakMap<Node, boolean>;
}
