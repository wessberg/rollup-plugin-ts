import {MappedTypeNode} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given MappedTypeNode.
 * @param {DeconflictVisitorOptions<MappedTypeNode>} options
 * @returns {VisitResult<MappedTypeNode>}
 */
export function deconflictMappedTypeNode({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<MappedTypeNode>): MappedTypeNode | undefined {
	return childContinuation(node, {
		lValues: new Set([...lValues, node.typeParameter.name]),
		lexicalIdentifiers: new Set([...lexicalIdentifiers, node.typeParameter.name.text])
	});
}
