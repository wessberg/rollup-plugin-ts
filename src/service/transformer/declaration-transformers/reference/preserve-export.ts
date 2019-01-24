import {Node} from "typescript";
import {getIdentifiersForNode, hasDefaultExportModifiers, hasExportModifier} from "../util/util";
import {IReferenceCache} from "../cache/i-reference-cache";

/**
 * Returns true if the "export" keyword in front of the given node should be preserved
 * @param {Node} node
 * @param {Set<string>} usedExports
 * @param {IReferenceCache} cache
 * @returns {boolean}
 */
export function preserveExport(node: Node, usedExports: Set<string>, cache: IReferenceCache): boolean {
	if (!hasExportModifier(node)) return false;
	const identifiers = getIdentifiersForNode(node, cache);
	return identifiers.some(identifier => usedExports.has(identifier.text)) || (usedExports.has("default") && hasDefaultExportModifiers(node.modifiers));
}
