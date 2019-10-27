import {Node} from "typescript";

export interface ReferenceCache {
	identifierForNodeCache: WeakMap<Node, string | undefined>;
	hasReferencesCache: WeakMap<Node, boolean>;
}
