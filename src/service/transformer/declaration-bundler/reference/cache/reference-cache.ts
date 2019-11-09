import {Node} from "typescript";

export type ReferenceCache = WeakMap<Node, boolean>;
export type NodeToReferencedIdentifiersCache = Map<string, Set<Node>>;
export type SourceFileToNodeToReferencedIdentifiersCache = Map<string, NodeToReferencedIdentifiersCache>;
