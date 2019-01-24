import {Identifier, Node} from "typescript";
import {WeakMultiMap} from "../../../../lib/multi-map/weak-multi-map";

export interface IReferenceCache {
	identifiersForNodeCache: WeakMultiMap<Node, Identifier>;
	hasReferencesCache: WeakMap<Node, boolean>;
	referencingNodesCache: WeakMultiMap<Node, Node>;
}
