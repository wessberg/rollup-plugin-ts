import {MappedTypeNode} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given MappedTypeNode.
 * @param {DeconflicterVisitorOptions<MappedTypeNode>} options
 * @returns {VisitResult<MappedTypeNode>}
 */
export function deconflictMappedTypeNode({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<MappedTypeNode>): MappedTypeNode | undefined {
	return childContinuation(node, {
		lValues: new Set([...lValues, node.typeParameter.name]),
		lexicalIdentifiers: new Set([...lexicalIdentifiers, node.typeParameter.name.text])
	});
}
