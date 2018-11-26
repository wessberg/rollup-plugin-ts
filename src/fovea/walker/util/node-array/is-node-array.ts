import {Node, NodeArray} from "typescript";

/**
 * Returns true if the given Node is a NodeArray
 * @param {Node | ts.NodeArray<Node>} node
 * @returns {node is Node | NodeArray<Node>}
 */
export function isNodeArray (node: Node|NodeArray<Node>): node is NodeArray<Node> {
	return Array.isArray(node);
}