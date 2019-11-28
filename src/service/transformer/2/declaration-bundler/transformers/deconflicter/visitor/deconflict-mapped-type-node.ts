import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ContinuationOptions} from "../deconflicter-options";

/**
 * Deconflicts the given MappedTypeNode.
 */
export function deconflictMappedTypeNode({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.MappedTypeNode>): TS.MappedTypeNode | undefined {
	// The TypeParameter has its own lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParameterContResult = continuation(node.typeParameter, nextContinuationOptions);
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);

	const isIdentical = typeParameterContResult === node.typeParameter && typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return typescript.updateMappedTypeNode(node, node.readonlyToken, typeParameterContResult, node.questionToken, typeContResult);
}
