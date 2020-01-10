import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";

/**
 * Deconflicts the given MappedTypeNode.
 */
export function deconflictMappedTypeNode(options: DeconflicterVisitorOptions<TS.MappedTypeNode>): TS.MappedTypeNode | undefined {
	const {node, continuation, lexicalEnvironment, typescript} = options;
	// The TypeParameter has its own lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParameterContResult = continuation(node.typeParameter, nextContinuationOptions);
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);

	const isIdentical = typeParameterContResult === node.typeParameter && typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(
		typescript.updateMappedTypeNode(node, node.readonlyToken, typeParameterContResult, node.questionToken, typeContResult),
		node,
		options
	);
}
