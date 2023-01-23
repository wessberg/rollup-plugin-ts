import type {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import type {ContinuationOptions} from "../deconflicter-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given MappedTypeNode.
 */
export function deconflictMappedTypeNode(options: DeconflicterVisitorOptions<TS.MappedTypeNode>): TS.MappedTypeNode | undefined {
	const {node, continuation, lexicalEnvironment, factory} = options;
	// The TypeParameter has its own lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParameterContResult = continuation(node.typeParameter, nextContinuationOptions);
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);
	const nameTypeContResult = node.nameType == null ? undefined : continuation(node.nameType, nextContinuationOptions);
	const membersContResult = node.members == null ? undefined : factory.createNodeArray(node.members.map(member => continuation(member, nextContinuationOptions)));

	const isIdentical = typeParameterContResult === node.typeParameter && typeContResult === node.type && nameTypeContResult === node.nameType;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(
		factory.updateMappedTypeNode(node, node.readonlyToken, typeParameterContResult, nameTypeContResult, node.questionToken, typeContResult, membersContResult),
		node,
		options
	);
}
